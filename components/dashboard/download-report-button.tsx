"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, FileSpreadsheet, FileText, Loader2 } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getExportData } from "@/app/actions/reportActions";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";
import { format } from "date-fns";

interface DownloadReportButtonProps {
    dateFrom?: Date;
    dateTo?: Date;
    label?: boolean;
    className?: string;
}

export function DownloadReportButton({ dateFrom, dateTo, label = true, className }: DownloadReportButtonProps) {
    const [loading, setLoading] = useState(false);

    const fetchData = async () => {
        const res = await getExportData(dateFrom, dateTo);
        if (res.error || !res.data) {
            toast.error("Failed to fetch report data");
            return null;
        }
        if (res.data.length === 0) {
            toast.info("No completed jobs found for this period");
            return null;
        }
        return res.data;
    };

    const handleExportExcel = async () => {
        setLoading(true);
        try {
            const data = await fetchData();
            if (!data) return;

            const ws = XLSX.utils.json_to_sheet(data);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Report");

            // Auto-width columns roughly
            const wscols = Object.keys(data[0]).map(() => ({ wch: 20 }));
            ws['!cols'] = wscols;

            const filename = `Rydeon_Report_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
            XLSX.writeFile(wb, filename);
            toast.success("Excel report downloaded");
        } catch (error) {
            console.error("Excel export error:", error);
            toast.error("Failed to generate Excel report");
        } finally {
            setLoading(false);
        }
    };

    const handleExportPDF = async () => {
        setLoading(true);
        try {
            const data = await fetchData();
            if (!data) return;

            const doc = new jsPDF();

            // Header
            doc.setFontSize(20);
            doc.text("Rydeon Diary Report", 14, 22);
            doc.setFontSize(11);
            doc.text(`Generated on: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, 30);
            if (dateFrom && dateTo) {
                doc.text(`Period: ${format(dateFrom, 'dd/MM/yyyy')} - ${format(dateTo, 'dd/MM/yyyy')}`, 14, 36);
            } else {
                doc.text(`Period: All Time (Completed Jobs)`, 14, 36);
            }

            // Calculate Totals for Summary
            const totalRevenue = data.reduce((sum, item) => sum + (Number(item.Price) || 0), 0);
            const totalProfit = data.reduce((sum, item) => sum + (Number(item.Profit) || 0), 0);
            const totalJobs = data.length;

            doc.text(`Total Jobs: ${totalJobs}`, 14, 46);
            doc.text(`Total Revenue: £${totalRevenue.toFixed(2)}`, 70, 46);
            doc.text(`Total Profit: £${totalProfit.toFixed(2)}`, 140, 46);

            // Table
            const tableColumn = ["Date", "Time", "Vehicle", "Operator", "Price", "Profit", "Status"];
            const tableRows = data.map(item => [
                item.Date,
                item.Time,
                item.Vehicle,
                item.Operator,
                `£${Number(item.Price).toFixed(2)}`,
                `£${Number(item.Profit).toFixed(2)}`,
                item["Payment Status"]
            ]);

            autoTable(doc, {
                head: [tableColumn],
                body: tableRows,
                startY: 55,
                theme: 'striped',
                headStyles: { fillColor: [22, 163, 74] }, // Green-ish
            });

            doc.save(`Rydeon_Report_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
            toast.success("PDF report downloaded");
        } catch (error) {
            console.error("PDF export error:", error);
            toast.error("Failed to generate PDF report");
        } finally {
            setLoading(false);
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button disabled={loading} className={className}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="h-4 w-4 sm:mr-2" />}
                    {label && <span className="hidden sm:inline">Download Report</span>}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleExportExcel}>
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Export to Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportPDF}>
                    <FileText className="mr-2 h-4 w-4" />
                    Export to PDF
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
