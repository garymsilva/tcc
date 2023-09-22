import { expandToStringWithNL } from 'langium';

export const GoMod = expandToStringWithNL`
module {{module}}

go {{go_version}}

require (
{{direct_dependencies}}
)

require (
{{indirect_dependencies}}
)
`

export const StartCmd = expandToStringWithNL`
package cmd

import (
	"context"
	"sauron/config"
	"sauron/web/router"
	"sauron/web/server"
	"sync"
	"time"

	"github.com/gorilla/mux"
	"github.com/joaopandolfi/blackwhale/utils"
)

var mu sync.Mutex
var onlinePID int
var exit chan bool

func Commands(ctx context.Context, args []string, stop chan bool) chan bool {
	exit = make(chan bool)

	if len(args) == 0 {
		startWeb(stop)
		return exit
	}

	for _, arg := range args {
		switch arg {
		case "web":
			startWeb(stop)
		}
	}

	return exit
}

func register() {
	mu.Lock()
	onlinePID++
	mu.Unlock()
}

func propagate(stop chan bool) {
	mu.Lock()
	onlinePID--
	sig := onlinePID <= 0
	mu.Unlock()

	if sig {
		exit <- true
	}

	stop <- true
}

// ====== Initializers

func startWeb(stop chan bool) {
	register()
	r := mux.NewRouter()
	r.Use(mux.CORSMethodMiddleware(r))

	srv := server.New(r, config.Get())
	nr := router.New(srv)
	nr.Setup()
	go srv.Start()

	go func() {
		<-stop
		utils.Info("[WEB] Gracefulling shutdown")
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		if err := srv.Shutdown(ctx); err != nil {
			utils.CriticalError("Server Shutdown Failed", err.Error())
		}
		propagate(stop)
		cancel()
	}()
}
`

export const Main = expandToStringWithNL`
package main

import (
	"context"
	"fmt"
	"io"
	"os"
	"os/signal"
	"runtime"
	"syscall"
	"time"

	"sauron/cmd"
	"sauron/config"

	"github.com/joaopandolfi/blackwhale/handlers"
	"github.com/joaopandolfi/blackwhale/remotes/cache"
	"github.com/joaopandolfi/blackwhale/remotes/jaeger"
	"github.com/opentracing/opentracing-go"

	"github.com/joaopandolfi/blackwhale/utils"
)

var tracerCloser io.Closer

func configInit(ctx context.Context) {
	config.Load(os.Args[1:])

	if config.Get().SnakeByDefault {
		handlers.ActiveSnakeCase()
	}

	// Init tracing
	tracer, closer := jaeger.Init("sauron")
	tracerCloser = closer
	opentracing.SetGlobalTracer(tracer)

	cache.Initialize(time.Minute * time.Duration(config.Get().GarbageCollectorMinutes))
}

func gracefullShutdown() {
	fmt.Println("<====================================Shutdown==================================>")
	if tracerCloser != nil {
		tracerCloser.Close()
	}
}

func welcome() {

	fmt.Println(\`
_____  ___       ___   _     _     ____     _____  _     ____  _           __    _     _    
 | |  / / \\     | |_) | | | | |   | |_       | |  | |_| | |_  | |\\/|      / /\\  | |   | |   
 |_|  \\_\\_/     |_| \\ \\_\\_/ |_|__ |_|__      |_|  |_| | |_|__ |_|  |     /_/--\\ |_|__ |_|__ 
 
O===============================================================(the eye that sees everything)==>
 \`)
}

func main() {
	runtime.GOMAXPROCS(runtime.NumCPU())

	welcome()

	ctx := context.Background()
	configInit(ctx)

	done := make(chan os.Signal, 1)
	signal.Notify(done, os.Interrupt, syscall.SIGINT, syscall.SIGTERM)

	finish := make(chan bool, 1)

	exit := cmd.Commands(ctx, os.Args[1:], finish)

	sig := <-done
	gracefullShutdown()

	finish <- true
	<-exit
	utils.Info("[SERVER] - Shutdown", "signal", sig)
}

`

export const Config = expandToStringWithNL`
package config

import (
	"fmt"
	"os"
	"strconv"
	"time"

	c "github.com/joaopandolfi/blackwhale/configurations"
	"github.com/joho/godotenv"
	"github.com/unrolled/secure"
)

type Config struct {
	File                    map[string]string
	AESKey                  string
	DefaultPassword         string
	BcryptCost              int
	SystemID                int
	SystemToken             string
	Propertyes              c.Configurations
	PostgreSQL              string
	Server                  server        \`json:"server"\`
	SnakeByDefault          bool
	GarbageCollectorMinutes int
}

type server struct {
	Port         string
	Host         string
	TimeoutWrite time.Duration
	TimeoutRead  time.Duration
	Debug        bool
	Security     security
}

type security struct {
	TLSCert    string
	TLSKey     string
	Opsec      secure.Options
	BcryptCost int //10,11,12,13,14
	JWTSecret  string
	AESKey     string
}

// Config global
var cfg *Config

// Get Config
func Get() Config {
	if cfg == nil {
		panic(fmt.Errorf("config not loaded"))
	}

	return *cfg
}

func (c *Config) getEnvOrFile(key string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return cfg.File[key]
}

// Load config
func Load(args []string) {
	godotenv.Load(".env")
	cfile := "./config.json"
	cfg = &Config{
		File: c.LoadJsonFile(cfile),
	}
	c.LoadConfig(c.LoadFromFile(cfile))
	cfg.Propertyes = c.Configuration
	systemID, _ := strconv.Atoi(cfg.File["SYSTEM_ID"])
	cfg.SystemID = systemID
	cfg.SystemToken = cfg.getEnvOrFile("SYSTEM_TOKEN")

	cfg.AESKey = cfg.getEnvOrFile("AES_KEY")
	cfg.Server.Security.AESKey = cfg.AESKey
	cfg.SnakeByDefault, _ = strconv.ParseBool(cfg.getEnvOrFile("SNAKE_DEFAULT"))

	cfg.PostgreSQL =
		fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
			cfg.getEnvOrFile("POSTGRESQL_HOST"), cfg.getEnvOrFile("POSTGRESQL_PORT"), cfg.getEnvOrFile("POSTGRESQL_USER"),
			cfg.getEnvOrFile("POSTGRESQL_PASSWORD"), cfg.getEnvOrFile("POSTGRESQL_DB"))

	cfg.BcryptCost, _ = strconv.Atoi(cfg.getEnvOrFile("BCRYPT_COST"))
	cfg.DefaultPassword = cfg.getEnvOrFile("DEFAULT_PASSWORD")

	cfg.Server.Security.JWTSecret = cfg.getEnvOrFile("JWT_SECRET")
	c.Configuration.Security.JWTSecret = cfg.Server.Security.JWTSecret

	c.Configuration.SlackChannel = cfg.getEnvOrFile("SLACK_CHANNEL")
	c.Configuration.SlackToken = cfg.getEnvOrFile("SLACK_TOKEN")
	c.Configuration.SlackWebHook = []string{cfg.getEnvOrFile("SLACK_WEBHOOK")}

	cfg.GarbageCollectorMinutes = 5 // Hardcoded by default

	// Load And Inject Jaeger Envs
	os.Setenv("JAEGER_SERVICE_NAME", fmt.Sprintf("samples%s", cfg.getEnvOrFile("JAEGER_ENVIRONMENT")))
	os.Setenv("JAEGER_AGENT_HOST", cfg.getEnvOrFile("JAEGER_AGENT_HOST"))
	os.Setenv("JAEGER_SAMPLER_TYPE", cfg.getEnvOrFile("JAEGER_SAMPLER_TYPE"))
	os.Setenv("JAEGER_SAMPLER_PARAM", cfg.getEnvOrFile("JAEGER_SAMPLER_PARAM"))
	os.Setenv("JAEGER_REPORTER_LOG_SPANS", cfg.getEnvOrFile("JAEGER_REPORTER_LOG_SPANS"))
}

func Inject(c *Config) {
	cfg = c
}
`

export const ControllerInterface = expandToStringWithNL`
package controllers

import (
	"sauron/web/server"
)

// Controller public contract
type Controller interface {
	SetupRouter(s *server.Server)
}
`

export const Router = expandToStringWithNL`
package router

import (
	"sauron/config"
  "sauron/web/server"
	"github.com/unrolled/secure"
)

// Router public struct
type Router struct {
	s *server.Server
}

// New Router
func New(s *server.Server) Router {
	return Router{s: s}
}

// Setup router
func (r *Router) Setup() {
}

// CreateSubRouter with path
func (r *Router) createSubRouter(path string) *server.Server {
	return &server.Server{
		R:      r.s.R.PathPrefix(path).Subrouter(),
		Config: r.s.Config,
	}
}

func (r *Router) secure() {
	secureMiddleware := secure.New(config.Get().Propertyes.Security.Options)
	r.s.R.Use(secureMiddleware.Handler)
}
`

export const WebServer = expandToStringWithNL`
package server

import (
	"context"
	"net/http"

	"sauron/config"

	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
	"github.com/joaopandolfi/blackwhale/utils"
)

// Server web
type Server struct {
	R      *mux.Router
	Config config.Config
	srv    *http.Server
}

// New server
func New(r *mux.Router, conf config.Config) *Server {
	// Bind to a port and pass our router in
	utils.Info("Server listenning on", conf.Propertyes.Port)
	srv := &http.Server{
		Handler:      handlers.CompressHandler(r),
		Addr:         conf.Propertyes.Port,
		WriteTimeout: conf.Propertyes.Timeout.Write,
		ReadTimeout:  conf.Propertyes.Timeout.Read,
	}

	return &Server{
		R:      r,
		Config: conf,
		srv:    srv,
	}
}

// Start Web server
func (s *Server) Start() {

	var err error
	if config.Get().Propertyes.Security.Debug {
		err = s.srv.ListenAndServe()
	} else {
		err = s.srv.ListenAndServeTLS(config.Get().Propertyes.Security.TLSCert, config.Get().Propertyes.Security.TLSKey)
	}
	if err != nil && err != http.ErrServerClosed {
		utils.CriticalError("Fatal server error", err.Error())
	}
}

// Shutdown server
func (s *Server) Shutdown(ctx context.Context) error {
	return s.srv.Shutdown(ctx)
}
`