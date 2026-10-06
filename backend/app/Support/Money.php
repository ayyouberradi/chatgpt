<?php

namespace App\Support;

use Illuminate\Validation\ValidationException;

final class Money
{
    public static function scaled(mixed $value, int $precision = 2): int
    {
        $text = str_replace(',', '.', trim((string) $value));
        if (! preg_match('/^\d{1,9}(?:\.\d{1,'.$precision.'})?$/D', $text)) {
            throw ValidationException::withMessages(['amount' => 'Enter a positive amount with at most '.$precision.' decimal places.']);
        }
        [$whole,$fraction] = array_pad(explode('.', $text, 2), 2, '');

        return ((int) $whole) * (10 ** $precision) + (int) str_pad($fraction, $precision, '0');
    }

    public static function decimal(int $value, int $precision = 2): string
    {
        return intdiv($value, 10 ** $precision).'.'.str_pad((string) ($value % (10 ** $precision)), $precision, '0', STR_PAD_LEFT);
    }

    public static function rounded(int $numerator, int $denominator): int
    {
        return intdiv($numerator + intdiv($denominator,2), $denominator);
    }
}
