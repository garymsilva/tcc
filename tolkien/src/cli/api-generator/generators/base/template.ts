import { expandToStringWithNL } from 'langium';

export const Import = expandToStringWithNL`
import (
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
	"sauron/models/dao"
	"sauron/repository/pubsub"

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

	err := pubsub.Init(ctx, config.Get().GCloud.ProjectID)
	if err != nil {
		utils.Error("Starting Pub/Sub", err.Error())
	}

	dao.InitHasuraClient()

	cache.Initialize(time.Minute * time.Duration(config.Get().GarbageCollectorMinutes))
}

func gracefullShutdown() {
	fmt.Println("<====================================Shutdown==================================>")
	pubsub.Close()
	if tracerCloser != nil {
		tracerCloser.Close()
	}

	pubsub.Close()
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