<?php

return [
    'min_length'        => (int)  env('PASSWORD_MIN_LENGTH',        10),
    'require_uppercase' => (bool) (env('PASSWORD_REQUIRE_UPPERCASE', 'true') !== 'false'),
    'require_lowercase' => (bool) (env('PASSWORD_REQUIRE_LOWERCASE', 'true') !== 'false'),
    'require_digit'     => (bool) (env('PASSWORD_REQUIRE_DIGIT',     'true') !== 'false'),
    'require_special'   => (bool) (env('PASSWORD_REQUIRE_SPECIAL',   'true') !== 'false'),
];
