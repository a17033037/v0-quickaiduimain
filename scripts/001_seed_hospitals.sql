-- Clear existing data
TRUNCATE TABLE hospitals CASCADE;

-- Insert real hospital data from major cities
-- Format: (name, location, latitude, longitude, general_beds, emergency_beds, icu_beds, distance)

INSERT INTO hospitals (id, name, location, general_beds_available, emergency_beds_available, icu_beds_available, distance_km, last_updated) VALUES
-- Mumbai Hospitals
(gen_random_uuid(), 'Lilavati Hospital and Research Centre', '19.0522,72.8306', 45, 12, 8, 2.5, NOW()),
(gen_random_uuid(), 'Kokilaben Dhirubhai Ambani Hospital', '19.1335,72.8262', 38, 10, 6, 3.2, NOW()),
(gen_random_uuid(), 'Breach Candy Hospital', '18.9767,72.8076', 28, 8, 5, 4.1, NOW()),
(gen_random_uuid(), 'Jaslok Hospital and Research Centre', '18.9625,72.8081', 32, 9, 7, 5.0, NOW()),
(gen_random_uuid(), 'Hinduja Hospital', '19.0544,72.8314', 41, 11, 6, 2.8, NOW()),
(gen_random_uuid(), 'Nanavati Super Speciality Hospital', '19.0410,72.8269', 35, 10, 5, 3.5, NOW()),
(gen_random_uuid(), 'Tata Memorial Hospital', '19.0073,72.8434', 50, 15, 10, 6.2, NOW()),
(gen_random_uuid(), 'Fortis Hospital Mulund', '19.1631,72.9559', 30, 8, 4, 8.5, NOW()),

-- Delhi Hospitals
(gen_random_uuid(), 'All India Institute of Medical Sciences (AIIMS)', '28.5672,77.2100', 60, 18, 12, 3.8, NOW()),
(gen_random_uuid(), 'Max Super Speciality Hospital Saket', '28.5244,77.2066', 42, 12, 8, 5.5, NOW()),
(gen_random_uuid(), 'Fortis Escorts Heart Institute', '28.5513,77.2750', 35, 10, 6, 4.2, NOW()),
(gen_random_uuid(), 'Apollo Hospital Delhi', '28.5354,77.2621', 48, 14, 9, 6.0, NOW()),
(gen_random_uuid(), 'Sir Ganga Ram Hospital', '28.6366,77.1949', 40, 11, 7, 3.5, NOW()),
(gen_random_uuid(), 'Safdarjung Hospital', '28.5677,77.2063', 55, 16, 10, 4.8, NOW()),
(gen_random_uuid(), 'BLK Super Speciality Hospital', '28.6503,77.1656', 38, 10, 6, 5.2, NOW()),

-- Bangalore Hospitals
(gen_random_uuid(), 'Manipal Hospital Bangalore', '12.9889,77.6397', 44, 13, 8, 4.5, NOW()),
(gen_random_uuid(), 'Apollo Hospital Bangalore', '12.9449,77.6077', 50, 15, 10, 5.8, NOW()),
(gen_random_uuid(), 'Fortis Hospital Bangalore', '12.9180,77.6192', 36, 10, 6, 6.2, NOW()),
(gen_random_uuid(), 'Columbia Asia Referral Hospital', '12.9063,77.6448', 32, 9, 5, 7.1, NOW()),
(gen_random_uuid(), 'St. John''s Medical College Hospital', '12.9476,77.5993', 40, 12, 7, 4.0, NOW()),
(gen_random_uuid(), 'Narayana Health City', '12.8109,77.5449', 55, 16, 11, 9.5, NOW()),

-- Chennai Hospitals
(gen_random_uuid(), 'Apollo Hospital Chennai', '13.0569,80.2509', 52, 15, 10, 5.0, NOW()),
(gen_random_uuid(), 'Fortis Malar Hospital', '13.0525,80.2544', 38, 11, 7, 4.5, NOW()),
(gen_random_uuid(), 'MIOT International Hospital', '13.0186,80.2532', 42, 12, 8, 6.8, NOW()),
(gen_random_uuid(), 'Stanley Medical College Hospital', '13.0878,80.2785', 48, 14, 9, 3.2, NOW()),

-- Kolkata Hospitals
(gen_random_uuid(), 'AMRI Hospital Kolkata', '22.5354,88.3942', 40, 11, 7, 4.8, NOW()),
(gen_random_uuid(), 'Apollo Gleneagles Hospital', '22.5200,88.3520', 45, 13, 8, 5.5, NOW()),
(gen_random_uuid(), 'Fortis Hospital Kolkata', '22.5184,88.3686', 35, 10, 6, 6.0, NOW()),
(gen_random_uuid(), 'Medical College and Hospital Kolkata', '22.5855,88.3963', 50, 15, 10, 3.5, NOW()),

-- Hyderabad Hospitals
(gen_random_uuid(), 'Apollo Hospital Hyderabad', '17.4375,78.3713', 48, 14, 9, 5.2, NOW()),
(gen_random_uuid(), 'KIMS Hospital Hyderabad', '17.4392,78.4483', 42, 12, 8, 4.8, NOW()),
(gen_random_uuid(), 'Continental Hospital', '17.4521,78.3807', 38, 10, 6, 5.8, NOW()),
(gen_random_uuid(), 'Yashoda Hospital Hyderabad', '17.4065,78.4772', 40, 11, 7, 6.5, NOW()),

-- Pune Hospitals
(gen_random_uuid(), 'Ruby Hall Clinic', '18.5196,73.8553', 35, 10, 6, 3.5, NOW()),
(gen_random_uuid(), 'Jehangir Hospital', '18.5304,73.8567', 32, 9, 5, 4.0, NOW()),
(gen_random_uuid(), 'Deenanath Mangeshkar Hospital', '18.4652,73.8097', 40, 11, 7, 5.5, NOW()),
(gen_random_uuid(), 'Sahyadri Super Speciality Hospital', '18.5362,73.9232', 38, 10, 6, 6.2, NOW());

-- Add location coordinates as JSONB for map rendering
ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS coordinates JSONB;

UPDATE hospitals 
SET coordinates = jsonb_build_object(
  'lat', CAST(SPLIT_PART(location, ',', 1) AS FLOAT),
  'lng', CAST(SPLIT_PART(location, ',', 2) AS FLOAT)
)
WHERE location IS NOT NULL AND location LIKE '%,%';
