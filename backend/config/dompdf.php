<?php

return [
    // Hostinger places public_html beside Laravel; use the application's configured
    // public directory rather than Dompdf's default base_path('public').
    'public_path' => public_path(),
];
