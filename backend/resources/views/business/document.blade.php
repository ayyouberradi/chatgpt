@if(in_array($document->type, ['quote', 'invoice']))
@include('business.commercial-document')
@else
@include('business.legal-document')
@endif
