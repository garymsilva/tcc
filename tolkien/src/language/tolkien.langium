grammar Tolkien

entry Model:
(
    module=Module |
    goVersion=GoVersion |
    dependencies+=Dependency |
    domain+=Domain |
    daos+=Dao |
    services+=Service |
    controllers+=Controller
)*;

Module:
    'module' name=ID;

GoVersion:
    'goVersion' name=STRING;

Dependency:
    'lib' name=STRING;

Domain:
    'model' name=ID;

Method:
    'func' name=ID;

Handler:
    Method;

Dao:
    'dao' name=ID ('{'(methods+=Method)*'}')?;

Service:
    'service' name=ID ('{'(services+=Service | daos+=Dao | methods+=Method)*'}')?;

Controller:
    'controller' name=ID ('{'(services+=Service | handlers+=Handler)*'}')?;

hidden terminal WS: /\s+/;
terminal ID: /[_a-zA-Z][\w_]*/;



terminal INT returns number: /[0-9]+/;
terminal STRING: /"(\\.|[^"\\])*"|'(\\.|[^'\\])*'/;

hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
hidden terminal SL_COMMENT: /\/\/[^\n\r]*/;
