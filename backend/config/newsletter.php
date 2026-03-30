<?php

return [
    'from_address' => env('NEWSLETTER_FROM_ADDRESS', env('MAIL_FROM_ADDRESS', 'newsletter@safoulee.fr')),
    'from_name'    => env('NEWSLETTER_FROM_NAME', 'La Neuville TAF sa Foulée'),
];
