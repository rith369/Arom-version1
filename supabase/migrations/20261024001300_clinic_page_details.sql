-- AROM: real clinic pages from the database (BACKEND-HANDOFF.md section 32).
--
-- Decided by Rith (24 Oct 2026):
--   * Clinics in the database show on Find Clinic & Hospital with their real
--     details. Today that is only UP Counseling (EMDRAC). The three other
--     clinics stay in the code, labelled "Sample", with no Call button.
--   * No admin page yet: these details are set here.
--   * The map is OpenStreetMap; "Directions" opens Google Maps.
--
--   1. clinics: about, tags, hours, photo, Google Maps link, services
--   2. UP Counseling (EMDRAC): the real details

-- 1. Page fields --------------------------------------------------------------------

alter table public.clinics
  add column if not exists about text,
  add column if not exists about_km text,
  add column if not exists tags text[] not null default '{}',
  add column if not exists tags_km text[] not null default '{}',
  add column if not exists hours_text text,
  add column if not exists hours_text_km text,
  add column if not exists image_url text,
  add column if not exists maps_url text check (maps_url is null or maps_url ~ '^https://'),
  -- [{ "id", "name", "nameKm", "duration", "durationKm", "fee", "description", "descriptionKm" }]
  add column if not exists service_details jsonb not null default '[]'::jsonb
    check (jsonb_typeof(service_details) = 'array');

-- 2. UP Counseling (EMDRAC) ----------------------------------------------------------

update public.clinics
set address = '#55, Street 180, Phnom Penh 12211',
    address_km = 'ផ្ទះលេខ ៥៥ ផ្លូវ ១៨០ រាជធានីភ្នំពេញ ១២២១១',
    city = 'Phnom Penh',
    latitude = 11.562662,
    longitude = 104.920725,
    -- EMDR Association Cambodia, from UP's booking form.
    phone = '+85589968678',
    website = 'https://puthisastra.edu.kh',
    maps_url = 'https://maps.app.goo.gl/wWw4a7ygPGPFe83L8',
    image_url = '/clinics/up-puthisastra.png',
    hours_text = 'Thursday and Friday, 8:30 AM to 4:30 PM',
    hours_text_km = 'ថ្ងៃព្រហស្បតិ៍ និងថ្ងៃសុក្រ ម៉ោង ៨:៣០ ព្រឹក ដល់ ៤:៣០ ល្ងាច',
    about = 'Free counseling for University of Puthisastra students and staff, with therapists from EMDR Association Cambodia (EMDRAC). Talk with a counselor about study or work stress, worry, low mood or anything on your mind, on campus or online.',
    about_km = 'ការប្រឹក្សាឥតគិតថ្លៃសម្រាប់និស្សិត និងបុគ្គលិកសាកលវិទ្យាល័យពុទ្ធិសាស្ត្រ ជាមួយអ្នកព្យាបាលពីសមាគម EMDR កម្ពុជា (EMDRAC)។ និយាយជាមួយអ្នកប្រឹក្សាអំពីសម្ពាធការសិក្សា ឬការងារ ការព្រួយបារម្ភ អារម្មណ៍ធ្លាក់ចុះ ឬអ្វីដែលនៅក្នុងចិត្តរបស់អ្នក នៅក្នុងបរិវេណសាលា ឬតាមអនឡាញ។',
    tags = '{Free for UP students and staff,Counseling,EMDR therapy}',
    tags_km = '{ឥតគិតថ្លៃសម្រាប់និស្សិត និងបុគ្គលិក UP,ការប្រឹក្សា (Counseling),ការព្យាបាល EMDR}',
    service_details = '[
      {
        "id": "up-counseling",
        "name": "Counseling session",
        "nameKm": "ការប្រឹក្សា (Counseling session)",
        "duration": "60 min",
        "durationKm": "៦០ នាទី",
        "fee": "Free",
        "description": "A private one to one session with an EMDRAC therapist, on campus or online.",
        "descriptionKm": "ការពិភាក្សាឯកជនម្នាក់ទល់ម្នាក់ជាមួយអ្នកព្យាបាល EMDRAC នៅក្នុងបរិវេណសាលា ឬតាមអនឡាញ។"
      }
    ]'::jsonb
where slug = 'up-wellness-clinic';
