<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\Record;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $search = trim((string) $request->query('search', ''));

        $records = Record::query();

        if ($search !== '') {
            $this->applyRecordSearch($records, $search);
        }

        $dates = Record::groupedByRecordedDate($records)->take(5)->values()->all();

        $documents = Document::query()->latest('created_at')->latest('id');

        if ($search !== '') {
            $like = '%'.$search.'%';
            $documents->where(function ($query) use ($like) {
                $query->where('name', 'like', $like)
                    ->orWhere('location', 'like', $like)
                    ->orWhere('extension', 'like', $like);
            });
        }

        $recentPerPage = 5;
        $recentPage = max(1, (int) $request->query('recent_page', 1));
        $recentTotal = (clone $documents)->count();
        $recentLastPage = max(1, (int) ceil($recentTotal / $recentPerPage));
        $recentPage = min($recentPage, $recentLastPage);

        $recent = (clone $documents)
            ->skip(($recentPage - 1) * $recentPerPage)
            ->take($recentPerPage)
            ->get();

        return response()->json([
            'dates' => $dates,
            'recent' => $recent,
            'recent_meta' => [
                'current_page' => $recentPage,
                'per_page' => $recentPerPage,
                'total' => $recentTotal,
                'last_page' => $recentLastPage,
            ],
        ]);
    }

    private function applyRecordSearch($query, string $search): void
    {
        $like = '%'.$search.'%';
        $query->where(function ($inner) use ($like) {
            $inner->where('reference_no', 'like', $like)
                ->orWhere('title', 'like', $like)
                ->orWhere('sender', 'like', $like)
                ->orWhere('received_by', 'like', $like)
                ->orWhere('oic', 'like', $like)
                ->orWhere('venue', 'like', $like)
                ->orWhere('remarks', 'like', $like)
                ->orWhere('routed_to', 'like', $like)
                ->orWhere('status', 'like', $like);
        });
    }
}
