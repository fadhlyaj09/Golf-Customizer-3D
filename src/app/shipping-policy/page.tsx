import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck } from "lucide-react";

export default function ShippingPolicyPage() {
    return (
        <div className="container mx-auto max-w-4xl py-12 px-4 md:px-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <Truck className="h-8 w-8 text-primary" />
                        <CardTitle className="text-3xl font-bold">Shipping Policy</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="prose prose-lg max-w-none text-muted-foreground">
                    <p className="font-semibold text-foreground">
                        Kami berkomitmen untuk mengirimkan pesanan bola golf custom Anda secepat mungkin. Berikut adalah kebijakan pengiriman kami:
                    </p>
                    
                    <h3 className="text-foreground">Same Day Shipping</h3>
                    <p>
                        Pesanan <strong>1 hingga 5 box</strong> dengan Custom Print yang pembayarannya telah kami terima dan konfirmasi <strong>sebelum pukul 15:00 WIB</strong> akan diproses dan dikirim pada hari yang sama.
                    </p>
                    <ul>
                        <li>Pesanan yang masuk setelah pukul 15:00 WIB akan diproses dan dikirim pada hari kerja berikutnya.</li>
                    </ul>

                    <h3 className="text-foreground">Pesanan Jumlah Besar</h3>
                    <p>
                        Untuk pesanan dengan jumlah <strong>lebih dari 5 box</strong>, estimasi waktu proses dan pengiriman adalah <strong>1 hingga 2 hari kerja</strong>. Kami akan selalu mengusahakan yang tercepat untuk Anda.
                    </p>

                    <h3 className="text-foreground">Jadwal Pengiriman</h3>
                    <p>
                        Pengiriman dilakukan setiap hari <strong>Senin hingga Sabtu</strong>.
                    </p>
                    <ul>
                        <li>Tidak ada pengiriman pada hari Minggu dan hari libur nasional. Pesanan yang masuk pada hari tersebut akan dikirim pada hari kerja berikutnya.</li>
                    </ul>
                    
                    <p className="mt-8">
                        Jika Anda memiliki pertanyaan lebih lanjut mengenai status pengiriman Anda, jangan ragu untuk menghubungi layanan pelanggan kami.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
