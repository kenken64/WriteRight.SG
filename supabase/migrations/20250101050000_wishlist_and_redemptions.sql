-- 006: Wishlist Items and Redemptions

CREATE TABLE wishlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  created_by TEXT NOT NULL CHECK (created_by IN ('student', 'parent')),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  reward_type TEXT NOT NULL CHECK (reward_type IN (
    'treat', 'screen_time', 'book', 'activity', 'money', 'creative', 'custom'
  )),
  required_achievement_id UUID REFERENCES achievements(id),
  is_surprise BOOLEAN DEFAULT false,
  expires_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending_parent' CHECK (status IN (
    'pending_parent', 'locked', 'claimable', 'claimed', 'fulfilled', 'expired'
  )),
  claimed_at TIMESTAMPTZ,
  fulfilled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wishlist_item_id UUID NOT NULL REFERENCES wishlist_items(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES student_profiles(id),
  parent_id UUID NOT NULL REFERENCES users(id),
  achievement_id UUID NOT NULL REFERENCES achievements(id),
  status TEXT DEFAULT 'claimed' CHECK (status IN (
    'claimed', 'acknowledged', 'pending_fulfilment',
    'completed', 'overdue', 'rescheduled', 'withdrawn'
  )),
  fulfilment_deadline TIMESTAMPTZ NOT NULL,
  rescheduled_deadline TIMESTAMPTZ,
  reschedule_reason TEXT,
  withdrawal_reason TEXT,
  fulfilment_photo_url TEXT,
  fulfilment_note TEXT,
  kid_confirmed BOOLEAN DEFAULT false,
  kid_confirmed_at TIMESTAMPTZ,
  claimed_at TIMESTAMPTZ DEFAULT now(),
  acknowledged_at TIMESTAMPTZ,
  fulfilled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE kid_nudges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  redemption_id UUID NOT NULL REFERENCES redemptions(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES student_profiles(id),
  sent_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_wishlist_student ON wishlist_items(student_id);
CREATE INDEX idx_wishlist_status ON wishlist_items(status);
CREATE INDEX idx_redemptions_student ON redemptions(student_id);
CREATE INDEX idx_redemptions_parent ON redemptions(parent_id);
CREATE INDEX idx_redemptions_status ON redemptions(status);
CREATE INDEX idx_kid_nudges_redemption ON kid_nudges(redemption_id);

ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE kid_nudges ENABLE ROW LEVEL SECURITY;
