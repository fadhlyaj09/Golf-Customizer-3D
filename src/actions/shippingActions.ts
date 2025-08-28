
'use server';

import type { City, Province, ShippingCost, GetShippingCostInput } from '@/lib/types';

// This is a mock implementation of a shipping API.
// In a real application, you would call a service like RajaOngkir, etc.
// The origin city is set in the .env file.

const provinces: Province[] = [
    { province_id: '1', province: 'Bali' },
    { province_id: '2', province: 'Bangka Belitung' },
    { province_id: '3', province: 'Banten' },
    { province_id: '4', province: 'Bengkulu' },
    { province_id: '5', province: 'DI Yogyakarta' },
    { province_id: '6', province: 'DKI Jakarta' },
    { province_id: '7', province: 'Gorontalo' },
    { province_id: '8', province: 'Jambi' },
    { province_id: '9', province: 'Jawa Barat' },
    { province_id: '10', province: 'Jawa Tengah' },
    { province_id: '11', province: 'Jawa Timur' },
    { province_id: '12', province: 'Kalimantan Barat' },
    { province_id: '13', province: 'Kalimantan Selatan' },
    { province_id: '14', province: 'Kalimantan Tengah' },
    { province_id: '15', province: 'Kalimantan Timur' },
    { province_id: '16', province: 'Kalimantan Utara' },
    { province_id: '17', province: 'Kepulauan Riau' },
    { province_id: '18', province: 'Lampung' },
    { province_id: '19', province: 'Maluku' },
    { province_id: '20', province: 'Maluku Utara' },
    { province_id: '21', province: 'Nanggroe Aceh Darussalam (NAD)' },
    { province_id: '22', province: 'Nusa Tenggara Barat (NTB)' },
    { province_id: '23', province: 'Nusa Tenggara Timur (NTT)' },
    { province_id: '24', province: 'Papua' },
    { province_id: '25', province: 'Papua Barat' },
    { province_id: '26', province: 'Riau' },
    { province_id: '27', province: 'Sulawesi Barat' },
    { province_id: '28', province: 'Sulawesi Selatan' },
    { province_id: '29', province: 'Sulawesi Tengah' },
    { province_id: '30', province: 'Sulawesi Tenggara' },
    { province_id: '31', province: 'Sulawesi Utara' },
    { province_id: '32', province: 'Sumatera Barat' },
    { province_id: '33', province: 'Sumatera Selatan' },
    { province_id: '34', province: 'Sumatera Utara' },
    { province_id: '35', province: 'Papua Selatan' },
    { province_id: '36', province: 'Papua Pegunungan' },
    { province_id: '37', province: 'Papua Tengah' },
    { province_id: '38', province: 'Papua Barat Daya' },
];

const cities: { [key: string]: City[] } = {
    '1': [ { city_id: '17', city_name: 'Badung' }, { city_id: '114', city_name: 'Denpasar' }, { city_id: '139', city_name: 'Gianyar' }, { city_id: '489', city_name: 'Tabanan' } ],
    '2': [ { city_id: '370', city_name: 'Pangkal Pinang' } ],
    '3': [ { city_id: '109', city_name: 'Cilegon' }, { city_id: '242', city_name: 'Lebak' }, { city_id: '368', city_name: 'Pandeglang' }, { city_id: '440', city_name: 'Serang' }, { city_id: '470', city_name: 'Tangerang' }, { city_id: '471', city_name: 'Tangerang Selatan' } ],
    '4': [ { city_id: '75', city_name: 'Bengkulu' } ],
    '5': [ { city_id: '210', city_name: 'Gunung Kidul' }, { city_id: '235', city_name: 'Kulon Progo' }, { city_id: '419', city_name: 'Sleman' }, { city_id: '573', city_name: 'Yogyakarta' } ],
    '6': [ { city_id: '151', city_name: 'Jakarta Barat' }, { city_id: '152', city_name: 'Jakarta Pusat' }, { city_id: '153', city_name: 'Jakarta Selatan' }, { city_id: '154', city_name: 'Jakarta Timur' }, { city_id: '155', city_name: 'Jakarta Utara' } ],
    '7': [ { city_id: '141', city_name: 'Gorontalo' } ],
    '8': [ { city_id: '158', city_name: 'Jambi' } ],
    '9': [ { city_id: '22', city_name: 'Bandung' }, { city_id: '23', city_name: 'Bandung Barat' }, { city_id: '78', city_name: 'Bekasi' }, { city_id: '91', city_name: 'Bogor' }, { city_id: '107', city_name: 'Ciamis' }, { city_id: '108', city_name: 'Cianjur' }, { city_id: '118', city_name: 'Cirebon' }, { city_id: '115', city_name: 'Depok' }, { city_id: '132', city_name: 'Garut' }, { city_id: '157', city_name: 'Indramayu' }, { city_id: '196', city_name: 'Karawang' }, { city_id: '236', city_name: 'Kuningan' }, { city_id: '252', city_name: 'Majalengka' }, { city_id: '378', city_name: 'Purwakarta' }, { city_id: '447', city_name: 'Subang' }, { city_id: '448', city_name: 'Sukabumi' }, { city_id: '459', city_name: 'Sumedang' }, { city_id: '484', city_name: 'Tasikmalaya' }, { city_id: '112', city_name: 'Cimahi' } ],
    '10': [ { city_id: '25', city_name: 'Banjarnegara' }, { city_id: '64', city_name: 'Banyumas' }, { city_id: '68', city_name: 'Batang' }, { city_id: '83', city_name: 'Blora' }, { city_id: '94', city_name: 'Boyolali' }, { city_id: '95', city_name: 'Brebes' }, { city_id: '106', city_name: 'Cilacap' }, { city_id: '113', city_name: 'Demak' }, { city_id: '178', city_name: 'Jepara' }, { city_id: '195', city_name: 'Karanganyar' }, { city_id: '202', city_name: 'Kebumen' }, { city_id: '205', city_name: 'Kendal' }, { city_id: '228', city_name: 'Klaten' }, { city_id: '234', city_name: 'Kudus' }, { city_id: '250', city_name: 'Magelang' }, { city_id: '373', city_name: 'Pati' }, { city_id: '374', city_name: 'Pekalongan' }, { city_id: '375', city_name: 'Pemalang' }, { city_id: '377', city_name: 'Purbalingga' }, { city_id: '379', city_name: 'Purworejo' }, { city_id: '392', city_name: 'Rembang' }, { city_id: '444', city_name: 'Semarang' }, { city_id: '456', city_name: 'Sragen' }, { city_id: '457', city_name: 'Surakarta (Solo)' }, { city_id: '468', city_name: 'Tegal' }, { city_id: '493', city_name: 'Temanggung' }, { city_id: '547', city_name: 'Wonogiri' }, { city_id: '548', city_name: 'Wonosobo' }, { city_id: '429', city_name: 'Salatiga' } ],
    '11': [ { city_id: '20', city_name: 'Bangkalan' }, { city_id: '65', city_name: 'Banyuwangi' }, { city_id: '86', city_name: 'Blitar' }, { city_id: '89', city_name: 'Bojonegoro' }, { city_id: '92', city_name: 'Bondowoso' }, { city_id: '142', city_name: 'Gresik' }, { city_id: '160', city_name: 'Jember' }, { city_id: '162', city_name: 'Jombang' }, { city_id: '203', city_name: 'Kediri' }, { city_id: '239', city_name: 'Lamongan' }, { city_id: '249', city_name: 'Lumajang' }, { city_id: '251', city_name: 'Madiun' }, { city_id: '253', city_name: 'Magetan' }, { city_id: '255', city_name: 'Malang' }, { city_id: '281', city_name: 'Mojokerto' }, { city_id: '292', city_name: 'Nganjuk' }, { city_id: '293', city_name: 'Ngawi' }, { city_id: '358', city_name: 'Pacitan' }, { city_id: '365', city_name: 'Pamekasan' }, { city_id: '372', city_name: 'Pasuruan' }, { city_id: '376', city_name: 'Ponorogo' }, { city_id: '381', city_name: 'Probolinggo' }, { city_id: '437', city_name: 'Sampang' }, { city_id: '445', city_name: 'Sidoarjo' }, { city_id: '446', city_name: 'Situbondo' }, { city_id: '458', city_name: 'Surabaya' }, { city_id: '509', city_name: 'Tuban' }, { city_id: '510', city_name: 'Tulungagung' }, { city_id: '69', city_name: 'Batu' } ],
    '12': [ { city_id: '208', city_name: 'Pontianak' }, { city_id: '450', city_name: 'Singkawang' } ],
    '13': [ { city_id: '24', city_name: 'Banjarbaru' }, { city_id: '26', city_name: 'Banjarmasin' } ],
    '14': [ { city_id: '364', city_name: 'Palangkaraya' } ],
    '15': [ { city_id: '21', city_name: 'Balikpapan' }, { city_id: '93', city_name: 'Bontang' }, { city_id: '433', city_name: 'Samarinda' } ],
    '16': [ { city_id: '477', city_name: 'Tarakan' } ],
    '17': [ { city_id: '70', city_name: 'Batam' }, { city_id: '472', city_name: 'Tanjung Pinang' } ],
    '18': [ { city_id: '56', city_name: 'Bandar Lampung' }, { city_id: '277', city_name: 'Metro' } ],
    '19': [ { city_id: '40', city_name: 'Ambon' } ],
    '20': [ { city_id: '488', city_name: 'Ternate' } ],
    '21': [ { city_id: '21', city_name: 'Banda Aceh' }, { city_id: '244', city_name: 'Lhokseumawe' }, { city_id: '428', city_name: 'Sabang' } ],
    '22': [ { city_id: '81', city_name: 'Bima' }, { city_id: '271', city_name: 'Mataram' } ],
    '23': [ { city_id: '237', city_name: 'Kupang' } ],
    '24': [ { city_id: '159', city_name: 'Jayapura' } ],
    '25': [ { city_id: '264', city_name: 'Manokwari' }, { city_id: '454', city_name: 'Sorong' } ],
    '26': [ { city_id: '374', city_name: 'Pekanbaru' }, { city_id: '117', city_name: 'Dumai' } ],
    '27': [ { city_id: '258', city_name: 'Majene' } ],
    '28': [ { city_id: '255', city_name: 'Makassar' }, { city_id: '366', city_name: 'Palopo' }, { city_id: '371', city_name: 'Parepare' } ],
    '29': [ { city_id: '363', city_name: 'Palu' } ],
    '30': [ { city_id: '72', city_name: 'Baubau' }, { city_id: '206', city_name: 'Kendari' } ],
    '31': [ { city_id: '85', city_name: 'Bitung' }, { city_id: '263', city_name: 'Manado' } ],
    '32': [ { city_id: '99', city_name: 'Bukittinggi' }, { city_id: '359', city_name: 'Padang' }, { city_id: '361', city_name: 'Padang Panjang' } ],
    '33': [ { city_id: '362', city_name: 'Palembang' }, { city_id: '380', city_name: 'Prabumulih' } ],
    '34': [ { city_id: '274', city_name: 'Medan' }, { city_id: '376', city_name: 'Pematang Siantar' }, { city_id: '441', city_name: 'Sibolga' }, { city_id: '472', city_name: 'Tanjung Balai' } ],
    '35': [ { city_id: '275', city_name: 'Merauke' } ],
    '36': [ { city_id: '566', city_name: 'Wamena' } ],
    '37': [ { city_id: '287', city_name: 'Nabire' }, { city_id: '497', city_name: 'Timika' } ],
    '38': [ { city_id: '454', city_name: 'Sorong' } ],
};

export async function getProvinces(): Promise<Province[]> {
    // In a real app, this would fetch from an API
    return provinces;
}

export async function getCities(provinceId: string): Promise<City[]> {
    // In a real app, this would fetch from an API
    return cities[provinceId] || [];
}

export async function getShippingCost(input: GetShippingCostInput): Promise<any> {
    const { destination, weight, courier } = input;
    const origin = process.env.NEXT_PUBLIC_SHIPPING_ORIGIN_CITY_ID || '22'; // Default to Bandung

    if (!destination || !weight || !courier) {
        return [];
    }

    // This is a mock API call.
    // We'll return some static data that mimics the real API response structure.
    console.log(`Calculating shipping from ${origin} to ${destination} for ${weight}g using ${courier}`);

    // Generate a semi-random cost based on destination ID and weight
    const baseCost = 10000 + (parseInt(destination, 10) % 100) * 100;
    const weightInKg = Math.ceil(weight / 1000);
    const finalCost = baseCost * weightInKg;

    // Simulate different services from JNE
    const shippingOptions = {
        code: 'jne',
        name: 'Jalur Nugraha Ekakurir (JNE)',
        costs: [
            {
                service: 'REG',
                description: 'Layanan Reguler',
                cost: [{ value: finalCost, etd: '2-3', note: '' }]
            },
            {
                service: 'YES',
                description: 'Yakin Esok Sampai',
                cost: [{ value: finalCost * 1.5, etd: '1-1', note: '' }]
            },
            {
                service: 'OKE',
                description: 'Ongkos Kirim Ekonomis',
                cost: [{ value: finalCost * 0.8, etd: '3-5', note: '' }]
            }
        ]
    };

    // Return the response inside an array, as the original structure expected it.
    return [shippingOptions];
}
