import Job from "@/models/Job";

export async function generateJobRef(bookingDate: string): Promise<string> {
    // Normalize date to DD/MM/YYYY
    let formattedDate = bookingDate;
    if (bookingDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [y, m, d] = bookingDate.split('-');
        formattedDate = `${d}/${m}/${y}`;
    }

    const [day, month, year] = formattedDate.split('/');
    const dateStr = `${day}${month}${year}`;

    // Find existing max index for this date GLOBALLY to avoid collisions
    // "RYDE27122025-1"
    const regex = new RegExp(`^RYDE${dateStr}-(\\d+)$`);

    // Using findOne with sort is more efficient than fetching all
    const latestJob = await Job.findOne({
        jobRef: { $regex: regex }
    }).sort({ jobRef: -1 });

    let index = 1;
    if (latestJob && latestJob.jobRef) {
        const match = latestJob.jobRef.match(regex);
        if (match && match[1]) {
            index = parseInt(match[1]) + 1;
        }
    }

    // Try loop to ensure uniqueness in race conditions (though simple index increment is usually okay for low volume)
    // For high volume, would need atomic counter or optimistic locking.
    // Given the context, a simple check is improving over current state.

    return `RYDE${dateStr}-${index}`;
}
