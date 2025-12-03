<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Asset;
use Carbon\Carbon;

class CalculateDepreciation extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'assets:depreciate';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Calculate and update asset depreciation values';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting depreciation calculation...');

        $assets = Asset::whereNotNull('purchase_date')
            ->where('purchase_cost', '>', 0)
            ->get();

        $count = 0;

        foreach ($assets as $asset) {
            $purchaseDate = Carbon::parse($asset->purchase_date);
            $monthsPassed = $purchaseDate->diffInMonths(now());

            // Ensure months passed is not negative (future purchase date)
            if ($monthsPassed < 0) {
                $monthsPassed = 0;
            }

            $usefulLife = $asset->useful_life_months > 0 ? $asset->useful_life_months : 36;
            $residualValue = $asset->residual_value;
            $purchaseCost = $asset->purchase_cost;

            // Straight-line depreciation formula
            // Depreciation per month = (Cost - Residual) / Useful Life
            // Total Depreciation = Depreciation per month * Months Passed
            // Current Value = Cost - Total Depreciation

            $depreciableAmount = $purchaseCost - $residualValue;
            $monthlyDepreciation = $depreciableAmount / $usefulLife;
            $totalDepreciation = $monthlyDepreciation * $monthsPassed;

            $currentValue = $purchaseCost - $totalDepreciation;

            // Ensure current value doesn't go below residual value (or 0)
            if ($currentValue < $residualValue) {
                $currentValue = $residualValue;
            }
            if ($currentValue < 0) {
                $currentValue = 0;
            }

            $asset->current_value = round($currentValue, 2);
            $asset->save();
            $count++;
        }

        $this->info("Depreciation calculated for {$count} assets.");
    }
}
