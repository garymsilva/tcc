grammar Tolkien

entry Model:
    (services+=Service | controllers+=Controller | daos+=Dao)*;

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
