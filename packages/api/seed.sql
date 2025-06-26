CREATE TABLE IF NOT EXISTS stocks (
  symbol TEXT PRIMARY KEY,
  name TEXT,
  sector TEXT,
  market_cap BIGINT,
  roe FLOAT,
  roce FLOAT,
  de_ratio FLOAT,
  eps_growth FLOAT,
  pe FLOAT
);

INSERT INTO stocks (symbol, name, sector, market_cap, roe, roce, de_ratio, eps_growth, pe) VALUES
('TCS', 'Tata Consultancy Services', 'IT', 12000000000000, 23.1, 19.7, 0.12, 14.5, 28.4)
ON CONFLICT (symbol) DO NOTHING; 