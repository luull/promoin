-- Tambah 43 outlet CHAGEE ke public.outlets.
-- Aman dijalankan ulang: data di-upsert berdasarkan (brand, name).
-- Field google_maps_rating dan google_maps_review_count dari JSON
-- dipetakan ke kolom rating dan review_count yang sudah ada.

begin;

-- Perbarui constraint brand tanpa menghapus data outlet yang sudah ada.
alter table public.outlets
    drop constraint if exists outlets_brand_check;

alter table public.outlets
    add constraint outlets_brand_check
    check (brand in ('fore', 'kopken', 'tomoro', 'starbuck', 'chagee'));

insert into public.outlets (
    brand, name, city_or_regency, address, opening_hours_displayed, source, source_url, verification_status, rating, review_count, notes
)
values
    ('chagee', 'AEON Mall BSD', 'Tangerang', 'Jl. BSD Raya Utama, Pagedangan, Kabupaten Tangerang, Banten 15339', null, 'CHAGEE Global official store locator', 'https://global.chagee.com/id/ind/stores', 'listed_on_official_store_locator', null, null, 'Jam operasional dan status buka real-time belum diverifikasi.'),
    ('chagee', 'AEON Deltamas', 'Bekasi', 'Jl. Ganesha Boulevard, Hegarmukti, Cikarang Pusat, Kabupaten Bekasi, Jawa Barat 17530', null, 'CHAGEE Global official store locator', 'https://global.chagee.com/id/ind/stores', 'listed_on_official_store_locator', null, null, 'Jam operasional dan status buka real-time belum diverifikasi.'),
    ('chagee', 'AEON Mall JGC', 'Jakarta Timur', 'Jl. Jakarta Garden City Boulevard No. 8, Cakung, Jakarta Timur 13910', null, 'CHAGEE Global official store locator', 'https://global.chagee.com/id/ind/stores', 'listed_on_official_store_locator', null, null, 'Jam operasional dan status buka real-time belum diverifikasi.'),
    ('chagee', 'AEON Mall Sentul City', 'Bogor', 'Jl. MH. Thamrin, Citaringgul, Babakan Madang, Kabupaten Bogor 16810', null, 'CHAGEE Global official store locator', 'https://global.chagee.com/id/ind/stores', 'official_locator_and_google_maps_match', 4.6, 34, 'Jam operasional dan status buka real-time belum diverifikasi.'),
    ('chagee', 'Agora Mall', 'Jakarta Pusat', 'Jl. M.H. Thamrin No. 10, Kebon Melati, Tanah Abang, Jakarta Pusat 10230', null, 'CHAGEE Global official store locator', 'https://global.chagee.com/id/ind/stores', 'listed_on_official_store_locator', null, null, 'Jam operasional dan status buka real-time belum diverifikasi.'),
    ('chagee', 'Botani Square Bogor', 'Bogor', 'Jl. Botani Square, Tegallega, Bogor Tengah, Kota Bogor 16129', null, 'CHAGEE Global official store locator', 'https://global.chagee.com/id/ind/stores', 'official_locator_and_google_maps_match', 4.5, 95, 'Jam operasional dan status buka real-time belum diverifikasi.'),
    ('chagee', 'Blok M Plaza', 'Jakarta Selatan', 'Jl. Bulungan No. 76, Kramat Pela, Kebayoran Baru, Jakarta Selatan 12130', null, 'CHAGEE Global official store locator', 'https://global.chagee.com/id/ind/stores', 'listed_on_official_store_locator', null, null, 'Jam operasional dan status buka real-time belum diverifikasi.'),
    ('chagee', 'Cibinong City Mall', 'Bogor', 'Jl. Tegar Beriman No. 1, Pakansari, Cibinong, Kabupaten Bogor 16915', null, 'CHAGEE Global official store locator', 'https://global.chagee.com/id/ind/stores', 'official_locator_and_google_maps_match', 4.3, 38, 'Jam operasional dan status buka real-time belum diverifikasi.'),
    ('chagee', 'Ciputra Mall Tangerang', 'Tangerang', 'Jl. Citra Raya Boulevard, Ciakar, Panongan, Kabupaten Tangerang 15710', null, 'CHAGEE Global official store locator', 'https://global.chagee.com/id/ind/stores', 'listed_on_official_store_locator', null, null, 'Jam operasional dan status buka real-time belum diverifikasi.'),
    ('chagee', 'Ciputra Mall', 'Jakarta Barat', 'Jl. Letjen S. Parman, Tanjung Duren Utara, Grogol Petamburan, Jakarta Barat 11470', null, 'CHAGEE Global official store locator', 'https://global.chagee.com/id/ind/stores', 'listed_on_official_store_locator', null, null, 'Jam operasional dan status buka real-time belum diverifikasi.'),
    ('chagee', 'Citywalk Sudirman', 'Jakarta Pusat', 'Jl. K.H. Mas Mansyur No. Kav. 121, Karet Tengsin, Jakarta Pusat 10220', null, 'CHAGEE Global official store locator', 'https://global.chagee.com/id/ind/stores', 'listed_on_official_store_locator', null, null, 'Jam operasional dan status buka real-time belum diverifikasi.'),
    ('chagee', 'Epiwalk', 'Jakarta Selatan', 'Jl. Epicentrum Boulevard Barat, Karet Kuningan, Setiabudi, Jakarta Selatan 12940', null, 'CHAGEE Global official store locator', 'https://global.chagee.com/id/ind/stores', 'listed_on_official_store_locator', null, null, 'Jam operasional dan status buka real-time belum diverifikasi.'),
    ('chagee', 'Flavor Bliss', 'Tangerang Selatan', 'The Flavor Bliss, Jl. Alam Sutera Boulevard, Pakulonan, Serpong Utara, Tangerang Selatan 15325', null, 'CHAGEE Global official store locator', 'https://global.chagee.com/id/ind/stores', 'listed_on_official_store_locator', null, null, 'Jam operasional dan status buka real-time belum diverifikasi.'),
    ('chagee', 'fX Sudirman', 'Jakarta Pusat', 'fX Sudirman, Jl. Jenderal Sudirman, Gelora, Tanah Abang, Jakarta Pusat 10270', null, 'CHAGEE Global official store locator', 'https://global.chagee.com/id/ind/stores', 'listed_on_official_store_locator', null, null, 'Jam operasional dan status buka real-time belum diverifikasi.'),
    ('chagee', 'Gandaria City', 'Jakarta Selatan', 'Jl. Sultan Iskandar Muda, Kebayoran Lama Utara, Jakarta Selatan 12240', null, 'CHAGEE Global official store locator', 'https://global.chagee.com/id/ind/stores', 'listed_on_official_store_locator', null, null, 'Jam operasional dan status buka real-time belum diverifikasi.'),
    ('chagee', 'Kota Kasablanka', 'Jakarta Selatan', 'Jl. Raya Casablanca No. Kav. 88, Menteng Dalam, Tebet, Jakarta Selatan 12870', null, 'CHAGEE Global official store locator', 'https://global.chagee.com/id/ind/stores', 'listed_on_official_store_locator', null, null, 'Jam operasional dan status buka real-time belum diverifikasi.'),
    ('chagee', 'K Mall Kemayoran', 'Jakarta Pusat', 'Jl. Kota Baru Bandar Kemayoran No. C-8, Kemayoran, Jakarta Pusat 10610', null, 'CHAGEE Global official store locator', 'https://global.chagee.com/id/ind/stores', 'listed_on_official_store_locator', null, null, 'Jam operasional dan status buka real-time belum diverifikasi.'),
    ('chagee', 'Kuningan City', 'Jakarta Selatan', 'Jl. Prof. DR. Satrio No. Kav. 18, Karet Kuningan, Jakarta Selatan 12940', null, 'CHAGEE Global official store locator', 'https://global.chagee.com/id/ind/stores', 'listed_on_official_store_locator', null, null, 'Jam operasional dan status buka real-time belum diverifikasi.'),
    ('chagee', 'Lippo Icon Cibubur', 'Jakarta Timur', 'Jl. Jambore No. 1, Cibubur, Ciracas, Jakarta Timur 13720', null, 'CHAGEE Global official store locator', 'https://global.chagee.com/id/ind/stores', 'listed_on_official_store_locator', null, null, 'Jam operasional dan status buka real-time belum diverifikasi.'),
    ('chagee', 'Lotte Mall Jakarta', 'Jakarta Selatan', 'Jl. Prof. DR. Satrio, Karet Kuningan, Setiabudi, Jakarta Selatan 12940', null, 'CHAGEE Global official store locator', 'https://global.chagee.com/id/ind/stores', 'official_locator_and_google_maps_match', 4.6, 296, 'Jam operasional dan status buka real-time belum diverifikasi.'),
    ('chagee', 'Lippo Mall Nusantara', 'Jakarta Selatan', 'Jl. Jend. Sudirman No. 50, Karet Semanggi, Jakarta Selatan 12930', null, 'CHAGEE Global official store locator', 'https://global.chagee.com/id/ind/stores', 'listed_on_official_store_locator', null, null, 'Jam operasional dan status buka real-time belum diverifikasi.'),
    ('chagee', 'Lippo Mall Puri', 'Jakarta Barat', 'Jl. Kembang Kerep, Kembangan Selatan, Jakarta Barat 11610', null, 'CHAGEE Global official store locator', 'https://global.chagee.com/id/ind/stores', 'listed_on_official_store_locator', null, null, 'Jam operasional dan status buka real-time belum diverifikasi.'),
    ('chagee', 'Living World Kota Wisata', 'Bogor', 'Jl. Boulevard Kota Wisata, Ciangsana, Gunung Putri, Kabupaten Bogor 16968', null, 'CHAGEE Global official store locator', 'https://global.chagee.com/id/ind/stores', 'official_locator_and_google_maps_match', 4.6, 65, 'Jam operasional dan status buka real-time belum diverifikasi.'),
    ('chagee', 'Living World Grand Wisata', 'Bekasi', 'Lambangjaya, Tambun Selatan, Kabupaten Bekasi 17510', null, 'CHAGEE Global official store locator', 'https://global.chagee.com/id/ind/stores', 'listed_on_official_store_locator', null, null, 'Jam operasional dan status buka real-time belum diverifikasi.'),
    ('chagee', 'Mal Artha Gading', 'Jakarta Utara', 'Jl. Boulevard Artha Gading, Kelapa Gading Barat, Jakarta Utara 14240', null, 'CHAGEE Global official store locator', 'https://global.chagee.com/id/ind/stores', 'listed_on_official_store_locator', null, null, 'Jam operasional dan status buka real-time belum diverifikasi.'),
    ('chagee', 'Mall of Indonesia', 'Jakarta Utara', 'Kelapa Gading Barat, Kelapa Gading, Jakarta Utara 14240', null, 'CHAGEE Global official store locator', 'https://global.chagee.com/id/ind/stores', 'listed_on_official_store_locator', null, null, 'Jam operasional dan status buka real-time belum diverifikasi.'),
    ('chagee', 'Margo City', 'Depok', 'Jl. Margonda Raya No. 358, Kemiri Muka, Beji, Kota Depok 16423', null, 'CHAGEE Global official store locator', 'https://global.chagee.com/id/ind/stores', 'official_locator_and_google_maps_match', 4.6, 136, 'Jam operasional dan status buka real-time belum diverifikasi.'),
    ('chagee', 'Mal Ciputra Cibubur', 'Bekasi', 'Jl. Alternatif Cibubur, Jatikarya, Jatisampurna, Kota Bekasi 17435', null, 'CHAGEE Global official store locator', 'https://global.chagee.com/id/ind/stores', 'official_locator_and_google_maps_match', 4.7, 64, 'Jam operasional dan status buka real-time belum diverifikasi.'),
    ('chagee', 'Pakuwon Mall Bekasi', 'Bekasi', 'Jl. Raya Pekayon No. 002, Pekayon Jaya, Bekasi Selatan, Kota Bekasi 17148', null, 'CHAGEE Global official store locator', 'https://global.chagee.com/id/ind/stores', 'official_locator_and_google_maps_match', 4.5, 105, 'Jam operasional dan status buka real-time belum diverifikasi.'),
    ('chagee', 'PIK Avenue', 'Jakarta Utara', 'PIK Avenue, Pantai Indah Kapuk Boulevard, Kamal Muara, Jakarta Utara 14470', null, 'CHAGEE Global official store locator', 'https://global.chagee.com/id/ind/stores', 'listed_on_official_store_locator', null, null, 'Jam operasional dan status buka real-time belum diverifikasi.'),
    ('chagee', 'Plaza Indonesia', 'Jakarta Pusat', 'Jl. M.H. Thamrin No. Kav. 28-30, Gondangdia, Menteng, Jakarta Pusat 10350', null, 'CHAGEE Global official store locator', 'https://global.chagee.com/id/ind/stores', 'listed_on_official_store_locator', null, null, 'Jam operasional dan status buka real-time belum diverifikasi.'),
    ('chagee', 'Pluit Village', 'Jakarta Utara', 'Jl. Pluit Indah, Pluit, Penjaringan, Jakarta Utara 14450', null, 'CHAGEE Global official store locator', 'https://global.chagee.com/id/ind/stores', 'listed_on_official_store_locator', null, null, 'Jam operasional dan status buka real-time belum diverifikasi.'),
    ('chagee', 'Pondok Indah Mall 1', 'Jakarta Selatan', 'Jl. Metro Pondok Indah No. 1, Pondok Pinang, Jakarta Selatan 12310', null, 'CHAGEE Global official store locator', 'https://global.chagee.com/id/ind/stores', 'official_locator_and_google_maps_match', 4.6, 93, 'Jam operasional dan status buka real-time belum diverifikasi.'),
    ('chagee', 'Puri Indah Mall', 'Jakarta Barat', 'Jl. Puri Indah Raya No. 10, Kembangan Selatan, Jakarta Barat 11610', null, 'CHAGEE Global official store locator', 'https://global.chagee.com/id/ind/stores', 'listed_on_official_store_locator', null, null, 'Jam operasional dan status buka real-time belum diverifikasi.'),
    ('chagee', 'Summarecon Mall Serpong', 'Tangerang', 'Jl. Boulevard Raya Gading Serpong, Pakulonan Barat, Kelapa Dua, Kabupaten Tangerang 15810', null, 'CHAGEE Global official store locator', 'https://global.chagee.com/id/ind/stores', 'listed_on_official_store_locator', null, null, 'Jam operasional dan status buka real-time belum diverifikasi.'),
    ('chagee', 'Summarecon Mall Bekasi', 'Bekasi', 'Jl. Boulevard Ahmad Yani, Marga Mulya, Bekasi Utara, Kota Bekasi 17142', null, 'CHAGEE Global official store locator', 'https://global.chagee.com/id/ind/stores', 'listed_on_official_store_locator', null, null, 'Jam operasional dan status buka real-time belum diverifikasi.'),
    ('chagee', 'Supermal Karawaci', 'Tangerang', 'Jl. Boulevard Diponegoro No. 105, Bencongan, Kelapa Dua, Kabupaten Tangerang 15810', null, 'CHAGEE Global official store locator', 'https://global.chagee.com/id/ind/stores', 'listed_on_official_store_locator', null, null, 'Jam operasional dan status buka real-time belum diverifikasi.'),
    ('chagee', 'The Breeze', 'Tangerang', 'Jl. BSD Grand Boulevard, Sampora, Cisauk, Kabupaten Tangerang 15345', null, 'CHAGEE Global official store locator', 'https://global.chagee.com/id/ind/stores', 'listed_on_official_store_locator', null, null, 'Jam operasional dan status buka real-time belum diverifikasi.'),
    ('chagee', 'Trans Studio Mall Cibubur', 'Depok', 'Jl. Alternatif Cibubur No. 230A, Harjamukti, Cimanggis, Kota Depok 16454', null, 'CHAGEE Global official store locator', 'https://global.chagee.com/id/ind/stores', 'official_locator_and_google_maps_match', 4.8, 36, 'Jam operasional dan status buka real-time belum diverifikasi.'),
    ('chagee', 'WTC 2', 'Jakarta Selatan', 'Jl. Jenderal Sudirman No. Kav. 29-31, Karet Kuningan, Jakarta Selatan 12920', null, 'CHAGEE Global official store locator', 'https://global.chagee.com/id/ind/stores', 'listed_on_official_store_locator', null, null, 'Jam operasional dan status buka real-time belum diverifikasi.'),
    ('chagee', 'The Park Pejaten', 'Jakarta Selatan', 'Jl. Warung Jati Barat No. 39, Jati Padang, Pasar Minggu, Jakarta Selatan 12540', null, 'CHAGEE Global official store locator', 'https://global.chagee.com/id/ind/stores', 'listed_on_official_store_locator', null, null, 'Jam operasional dan status buka real-time belum diverifikasi.'),
    ('chagee', 'Pacific Place', 'Jakarta Selatan', 'Jl. Jend. Sudirman Kav. 52-53, Senayan, Kebayoran Baru, Jakarta Selatan 12190', null, 'CHAGEE Global official store locator', 'https://global.chagee.com/id/ind/stores', 'listed_on_official_store_locator', null, null, 'Jam operasional dan status buka real-time belum diverifikasi.'),
    ('chagee', 'Central Park', 'Jakarta Barat', 'Jl. Letjen S. Parman Kav. 28, Grogol, Jakarta Barat 11470', null, 'CHAGEE Global official store locator', 'https://global.chagee.com/id/ind/stores', 'listed_on_official_store_locator', null, null, 'Jam operasional dan status buka real-time belum diverifikasi.')
on conflict (brand, name) do update
set
    city_or_regency = excluded.city_or_regency,
    address = excluded.address,
    opening_hours_displayed = excluded.opening_hours_displayed,
    source = excluded.source,
    source_url = excluded.source_url,
    verification_status = excluded.verification_status,
    rating = excluded.rating,
    review_count = excluded.review_count,
    notes = excluded.notes;

-- Batalkan transaksi jika 43 outlet dari dataset belum masuk semuanya.
do $validation$
begin
    if (
        select count(*)
        from public.outlets
        where brand = 'chagee'
          and name in (
              'AEON Mall BSD', 'AEON Deltamas', 'AEON Mall JGC', 'AEON Mall Sentul City', 'Agora Mall', 'Botani Square Bogor', 'Blok M Plaza', 'Cibinong City Mall', 'Ciputra Mall Tangerang', 'Ciputra Mall', 'Citywalk Sudirman', 'Epiwalk', 'Flavor Bliss', 'fX Sudirman', 'Gandaria City', 'Kota Kasablanka', 'K Mall Kemayoran', 'Kuningan City', 'Lippo Icon Cibubur', 'Lotte Mall Jakarta', 'Lippo Mall Nusantara', 'Lippo Mall Puri', 'Living World Kota Wisata', 'Living World Grand Wisata', 'Mal Artha Gading', 'Mall of Indonesia', 'Margo City', 'Mal Ciputra Cibubur', 'Pakuwon Mall Bekasi', 'PIK Avenue', 'Plaza Indonesia', 'Pluit Village', 'Pondok Indah Mall 1', 'Puri Indah Mall', 'Summarecon Mall Serpong', 'Summarecon Mall Bekasi', 'Supermal Karawaci', 'The Breeze', 'Trans Studio Mall Cibubur', 'WTC 2', 'The Park Pejaten', 'Pacific Place', 'Central Park'
          )
    ) <> 43 then
        raise exception 'Data CHAGEE tidak lengkap: seharusnya 43 outlet';
    end if;
end
$validation$;

commit;

-- Hasil yang diharapkan: chagee | 43
select brand, count(*) as total
from public.outlets
where brand = 'chagee'
group by brand;
