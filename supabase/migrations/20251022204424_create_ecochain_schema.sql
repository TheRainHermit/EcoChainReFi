/*
  # EcoChain Database Schema

  1. New Tables
    - `wallets`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `wallet_address` (text, unique) - Base network wallet address
      - `ens_name` (text, nullable) - ENS name like miguel.eth
      - `qr_code` (text) - QR code data for scanning
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `eco_transactions`
      - `id` (uuid, primary key)
      - `wallet_id` (uuid, references wallets)
      - `material_type` (text) - Type of waste deposited
      - `eco_amount` (decimal) - Amount of $EC0 earned
      - `transaction_hash` (text, nullable) - Blockchain transaction hash
      - `created_at` (timestamptz)
    
    - `rewards`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `eco_cost` (decimal) - Cost in $EC0
      - `image_url` (text)
      - `type` (text) - 'nft' or 'physical'
      - `stock` (integer)
      - `created_at` (timestamptz)
    
    - `redemptions`
      - `id` (uuid, primary key)
      - `wallet_id` (uuid, references wallets)
      - `reward_id` (uuid, references rewards)
      - `eco_spent` (decimal)
      - `status` (text) - 'pending', 'completed', 'cancelled'
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Public read access for rewards
*/

CREATE TABLE IF NOT EXISTS wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  wallet_address text UNIQUE NOT NULL,
  ens_name text,
  qr_code text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS eco_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id uuid REFERENCES wallets(id) NOT NULL,
  material_type text NOT NULL,
  eco_amount decimal(10, 2) NOT NULL,
  transaction_hash text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  eco_cost decimal(10, 2) NOT NULL,
  image_url text NOT NULL,
  type text NOT NULL CHECK (type IN ('nft', 'physical')),
  stock integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id uuid REFERENCES wallets(id) NOT NULL,
  reward_id uuid REFERENCES rewards(id) NOT NULL,
  eco_spent decimal(10, 2) NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE eco_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE redemptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own wallet"
  ON wallets FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own wallet"
  ON wallets FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wallet"
  ON wallets FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their wallet transactions"
  ON eco_transactions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM wallets
      WHERE wallets.id = eco_transactions.wallet_id
      AND wallets.user_id = auth.uid()
    )
  );

CREATE POLICY "System can create transactions"
  ON eco_transactions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM wallets
      WHERE wallets.id = eco_transactions.wallet_id
      AND wallets.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can view rewards"
  ON rewards FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can view their redemptions"
  ON redemptions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM wallets
      WHERE wallets.id = redemptions.wallet_id
      AND wallets.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create redemptions"
  ON redemptions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM wallets
      WHERE wallets.id = redemptions.wallet_id
      AND wallets.user_id = auth.uid()
    )
  );

CREATE INDEX idx_wallets_user_id ON wallets(user_id);
CREATE INDEX idx_wallets_address ON wallets(wallet_address);
CREATE INDEX idx_eco_transactions_wallet_id ON eco_transactions(wallet_id);
CREATE INDEX idx_redemptions_wallet_id ON redemptions(wallet_id);