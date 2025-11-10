import { daysUntil } from '../../utils/formatters';
import { Button } from '../ui';

interface TrialBannerProps {
  trialEndsAt: string;
}

export default function TrialBanner({ trialEndsAt }: TrialBannerProps) {
  const daysLeft = daysUntil(trialEndsAt);

  if (daysLeft === 0) {
    return (
      <div className="bg-red-50 border-b-2 border-red-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
          <div>
            <span className="font-semibold text-red-900">Your trial has expired</span>
            <span className="text-red-700 ml-2">Upgrade to Premium to continue using advanced features</span>
          </div>
          <Button variant="danger" size="sm">
            Upgrade Now
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-primary-50 border-b-2 border-primary-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
        <div>
          <span className="font-semibold text-primary-900">Trial: {daysLeft} day{daysLeft !== 1 ? 's' : ''} remaining</span>
          <span className="text-primary-700 ml-2">Upgrade to Premium for advanced learning features</span>
        </div>
        <Button variant="outline" size="sm">
          Upgrade
        </Button>
      </div>
    </div>
  );
}
