grammar Tolkien

entry Model:
(
    module=Module |
    goVersion=GoVersion |
    dependencies+=Dependency |
    services+=Service |
    controllers+=Controller |
    daos+=Dao
)*;

Module:
    'module' name=ID;

GoVersion:
    'goVersion' name=STRING;

Dependency:
    'lib' name=STRING;

Service:
    'service' name=ID;

Controller:
    'controller' name=ID 'services' '['services+=[Service:ID]']';

Dao:
    'dao' name=ID;

hidden terminal WS: /\s+/;
terminal ID: /[_a-zA-Z][\w_]*/;



terminal INT returns number: /[0-9]+/;
terminal STRING: /"(\\.|[^"\\])*"|'(\\.|[^'\\])*'/;

hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
hidden terminal SL_COMMENT: /\/\/[^\n\r]*/;
