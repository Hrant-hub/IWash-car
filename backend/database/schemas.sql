-- WashCar SQL Server Table Schema
-- TypeORM will auto-create this with synchronize:true
-- This file is for reference / manual setup only

CREATE TABLE users (
  id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  email NVARCHAR(255) NOT NULL UNIQUE,
  passwordHash NVARCHAR(255) NOT NULL,
  role NVARCHAR(20) NOT NULL DEFAULT 'none' CHECK (role IN ('customer', 'helper', 'none')),
  active BIT NOT NULL DEFAULT 0,
  lat FLOAT NULL,
  lng FLOAT NULL,
  carModel NVARCHAR(100) NULL,
  carBrandId INT NULL,
  carModelId INT NULL,
  plateNumber NVARCHAR(20) NULL,
  termsAccepted BIT NOT NULL DEFAULT 0,
  termsAcceptedAt DATETIME2 NULL,
  createdAt DATETIME2 DEFAULT GETUTCDATE(),
  updatedAt DATETIME2 DEFAULT GETUTCDATE()
);

CREATE TABLE car_brands (
  id INT IDENTITY(1,1) PRIMARY KEY,
  name NVARCHAR(80) NOT NULL UNIQUE
);

CREATE TABLE car_models (
  id INT IDENTITY(1,1) PRIMARY KEY,
  name NVARCHAR(100) NOT NULL,
  brandId INT NOT NULL,
  CONSTRAINT FK_car_models_brand FOREIGN KEY (brandId) REFERENCES car_brands(id) ON DELETE CASCADE
);

INSERT INTO car_brands (name) VALUES
('BMW'),
('Mercedes'),
('Toyota');

INSERT INTO car_models (name, brandId)
SELECT '3 Series', id FROM car_brands WHERE name = 'BMW'
UNION ALL SELECT '5 Series', id FROM car_brands WHERE name = 'BMW'
UNION ALL SELECT 'X5', id FROM car_brands WHERE name = 'BMW'
UNION ALL SELECT 'C Class', id FROM car_brands WHERE name = 'Mercedes'
UNION ALL SELECT 'E Class', id FROM car_brands WHERE name = 'Mercedes'
UNION ALL SELECT 'GLC', id FROM car_brands WHERE name = 'Mercedes'
UNION ALL SELECT 'Corolla', id FROM car_brands WHERE name = 'Toyota'
UNION ALL SELECT 'Camry', id FROM car_brands WHERE name = 'Toyota'
UNION ALL SELECT 'Prado', id FROM car_brands WHERE name = 'Toyota';

CREATE TABLE orders (
  id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  requestId NVARCHAR(50) NOT NULL UNIQUE,
  customerId UNIQUEIDENTIFIER NOT NULL,
  helperId UNIQUEIDENTIFIER NULL,
  status NVARCHAR(20) NOT NULL CHECK (status IN ('completed', 'cancelled')),
  customerLat FLOAT NOT NULL,
  customerLng FLOAT NOT NULL,
  customerAddress NVARCHAR(255) NULL,
  customerCarModel NVARCHAR(100) NULL,
  customerPlateNumber NVARCHAR(20) NULL,
  paymentMethod NVARCHAR(20) NULL,
  helperName NVARCHAR(100) NULL,
  helperDistanceKm FLOAT NULL,
  helperEtaMinutes INT NULL,
  conversation NVARCHAR(MAX) NULL,
  completedAt DATETIME2 NULL,
  createdAt DATETIME2 DEFAULT GETUTCDATE(),
  updatedAt DATETIME2 DEFAULT GETUTCDATE()
);

CREATE TABLE customer_cars (
  id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  customerId UNIQUEIDENTIFIER NOT NULL,
  model NVARCHAR(100) NOT NULL,
  plateNumber NVARCHAR(20) NOT NULL,
  createdAt DATETIME2 DEFAULT GETUTCDATE(),
  updatedAt DATETIME2 DEFAULT GETUTCDATE(),
  CONSTRAINT FK_customer_cars_user FOREIGN KEY (customerId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE customer_locations (
  id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  customerId UNIQUEIDENTIFIER NOT NULL,
  label NVARCHAR(80) NOT NULL,
  address NVARCHAR(255) NOT NULL,
  createdAt DATETIME2 DEFAULT GETUTCDATE(),
  updatedAt DATETIME2 DEFAULT GETUTCDATE(),
  CONSTRAINT FK_customer_locations_user FOREIGN KEY (customerId) REFERENCES users(id) ON DELETE CASCADE
);
