<?php

namespace App\Support;

use Illuminate\Validation\ValidationException;

final class WhatsAppPhone
{
    public static function normalize(string $phone): string
    {
        if (! preg_match('/^[+0-9(). \-]+$/D', trim($phone))) {
            self::invalid();
        }
        $phone = preg_replace('/[(). \-]/', '', trim($phone));
        if (str_starts_with($phone, '00')) {
            $phone = '+'.substr($phone, 2);
        }
        if (preg_match('/^0[5-7]\d{8}$/D', $phone)) {
            $phone = '+212'.substr($phone, 1);
        }
        if (preg_match('/^212[5-7]\d{8}$/D', $phone)) {
            $phone = '+'.$phone;
        }
        if (! preg_match('/^\+[1-9]\d{7,14}$/D', $phone)) {
            self::invalid();
        }

        return $phone;
    }

    private static function invalid(): never
    {
        throw ValidationException::withMessages(['phone' => 'Enter a phone number with country code, for example +212 708 295518.']);
    }
}
