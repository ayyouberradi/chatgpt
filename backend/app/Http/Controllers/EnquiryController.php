<?php

namespace App\Http\Controllers;

use App\Models\Lead;
use Illuminate\Http\Request;

class EnquiryController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:150', 'email' => 'required|email|max:255', 'phone' => 'nullable|string|max:60',
            'service' => 'required|in:website,seo,digital-marketing,photography,graphic-design,full-service',
            'business' => 'required|in:hotel-riad,restaurant-cafe,real-estate,ecommerce,medical,lawyer,other',
            'budget' => 'required|in:under-5000,5000-10000,10000-20000,20000-50000,50000-plus',
            'timeline' => 'required|in:urgent,within-30-days,flexible', 'message' => 'nullable|string|max:5000', 'honeypot' => 'nullable|string|max:0',
        ]);
        unset($data['honeypot']);
        Lead::create($data + ['source' => 'website', 'status' => 'new']);

        return response()->json(['message' => 'Enquiry received.'], 201);
    }
}
