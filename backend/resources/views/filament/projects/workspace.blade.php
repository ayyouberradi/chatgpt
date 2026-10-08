<div class="space-y-6">
<p><strong>{{ $project->client->display_name }}</strong> · {{ \App\Models\Project::STATUSES[$project->status] }} · Deadline: {{ $project->due_on?->format('d/m/Y') ?? 'Not set' }}</p>
<h3 class="font-semibold">Tasks and deliverables</h3>
@forelse($project->tasks as $task)<div class="rounded-xl border p-4"><strong>{{ $task->title }}</strong><p>{{ $task->kind }} · {{ $task->status }} · {{ $task->approval_status }} · {{ $task->due_on?->format('d/m/Y') ?? 'No deadline' }}</p>@if($task->client_feedback)<p>Client feedback: {{ $task->client_feedback }}</p>@endif</div>@empty<p>No tasks yet. Use Tasks & deliverables to add work and review requests.</p>@endforelse
<h3 class="font-semibold">Linked documents and payments</h3>
@foreach($project->documents() as $document)<div class="rounded-xl border p-4"><a href="{{ route('business.pdf',$document) }}" target="_blank" rel="noreferrer">{{ ucfirst($document->type) }} · {{ $document->display_number }} · {{ $document->display_total }}</a><p>{{ $document->display_status }}@if($document->type==='invoice') · Paid: {{ \App\Support\Money::decimal($document->paidAmount()) }} {{ $document->currency }} · Outstanding: {{ \App\Support\Money::decimal($document->balanceAmount()) }} {{ $document->currency }}@endif</p></div>@endforeach
@if($project->notes)<h3 class="font-semibold">Internal notes</h3><p class="whitespace-pre-line">{{ $project->notes }}</p>@endif
</div>
