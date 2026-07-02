"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Mengunci scroll pada <html> dan <body> selama panel admin aktif, sehingga
 * hanya area konten (<main>) yang bisa di-scroll. Sekaligus mereset posisi
 * scroll dokumen ke 0 setiap ganti halaman, mencegah scroll dokumen "nyangkut"
 * yang membuat shell tergeser naik dan memunculkan dead space di bawah.
 * Login/halaman lain tidak terpengaruh karena efek dibersihkan saat unmount.
 */
export default function LockBodyScroll() {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;

    window.scrollTo(0, 0);
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";

    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
    };
  }, []);

  return null;
}
