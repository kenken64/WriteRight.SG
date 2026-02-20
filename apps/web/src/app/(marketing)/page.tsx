import { getVariant } from '@/lib/variant';
import { LandingSg } from '@/components/marketing/landing-sg';
import { LandingInternational } from '@/components/marketing/landing-international';

export default function LandingPage() {
  const variant = getVariant();
  return variant === 'international' ? <LandingInternational /> : <LandingSg />;
}
