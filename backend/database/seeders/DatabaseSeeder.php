<?php

namespace Database\Seeders;

use App\Models\Document;
use App\Models\Record;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::query()->updateOrCreate(
            ['username' => 'admin'],
            [
                'name' => 'CPDO Admin',
                'email' => 'admin@cpdo.local',
                'password' => 'admin123',
            ],
        );

        $shared = [
            'received_by' => 'John Doe',
            'oic' => 'Mr. Smith',
            'venue' => 'Panabo Gym',
            'remarks' => 'Urgent',
            'routed_to' => 'Mr. Sam',
            'document_label' => '.pdf',
            'due_on' => null,
            'status' => 'Approved',
        ];

        $rows = [
            ['DOC-001', 'Memo on Budget Approval', 'Finance Department', '2025-02-12 10:00:00', '2025-02-12 13:00:00'],
            ['DOC-002', 'Project Proposal', 'IT Department', '2025-02-12 10:00:00', '2025-02-12 13:00:00'],
            ['DOC-003', 'Supplier Contract', 'Finance Department', '2025-02-12 10:00:00', '2025-02-12 13:00:00'],
            ['DOC-004', 'Zoning Clearance Request', 'Engineering Office', '2025-02-11 09:30:00', '2025-02-11 14:00:00'],
            ['DOC-005', 'Site Inspection Report', 'CPDO Field Team', '2025-02-10 08:15:00', '2025-02-10 11:45:00'],
        ];

        foreach ($rows as [$reference, $title, $sender, $received, $routed]) {
            Record::query()->updateOrCreate(
                ['reference_no' => $reference],
                array_merge($shared, [
                    'title' => $title,
                    'sender' => $sender,
                    'received_at' => $received,
                    'routed_at' => $routed,
                ]),
            );
        }

        $sunday = Carbon::now()->previous(Carbon::SUNDAY)->setTime(20, 59);
        if (Carbon::now()->isSunday()) {
            $sunday = Carbon::now()->setTime(20, 59);
        }

        $files = [
            ['JUSTINE TABANAO - Daily-Time-Record-OJT', 'xlsx', 'Desktop', $sunday->copy()],
            ['JUSTINE TABANAO - Daily-Time-Record-OJT', 'xlsx', "Justine Tabanao's OneDrive > Documents > Desktop", $sunday->copy()->setTime(20, 35)],
            ['New Solo Parent Form 2025 (1)', 'xlsx', 'OneDrive - Personal > Documents > Downloads', Carbon::parse('2025-01-07 09:00:00')],
            ['New Solo Parent Form 2025', 'xlsx', 'OneDrive - Personal > Documents > Downloads', Carbon::parse('2025-01-07 08:40:00')],
        ];

        foreach (range(1, 9) as $index) {
            $files[] = [
                'CPDO File '.$index,
                'pdf',
                'CPDO Records',
                Carbon::parse('2024-12-01 08:00:00')->addDays($index),
            ];
        }

        foreach ($files as [$name, $extension, $location, $updatedAt]) {
            $safe = str($name.'-'.$updatedAt->format('YmdHis'))->slug();
            $path = 'documents/'.$safe.'.'.$extension;
            Storage::disk('public')->put($path, $this->placeholder($name, $extension));

            $document = Document::query()->updateOrCreate(
                ['name' => $name, 'location' => $location],
                [
                    'extension' => $extension,
                    'stored_path' => $path,
                    'size' => Storage::disk('public')->size($path),
                    'user_id' => null,
                ],
            );

            $document->timestamps = false;
            $document->created_at = $updatedAt;
            $document->updated_at = $updatedAt;
            $document->save();
        }
    }

    private function placeholder(string $name, string $extension): string
    {
        if ($extension === 'pdf') {
            $text = 'CPDO Document: '.$name;

            return "%PDF-1.1\n1 0 obj<< /Type /Catalog /Pages 2 0 R >>endobj\n2 0 obj<< /Type /Pages /Count 1 /Kids [3 0 R] >>endobj\n3 0 obj<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>endobj\n4 0 obj<< /Length ".strlen("BT /F1 18 Tf 72 720 Td (".$text.") Tj ET")." >>stream\nBT /F1 18 Tf 72 720 Td (".$text.") Tj ET\nendstream\nendobj\ntrailer<< /Root 1 0 R >>\n%%EOF";
        }

        return "CPDO file placeholder\n".$name."\n";
    }
}
