import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import SensorData from '@/models/SensorData';

export async function GET() {
    try {
        await dbConnect();

        // Get last 20 readings for the chart
        const data = await SensorData.find({})
            .sort({ _id: -1 })
            .limit(20);

        // Reverse them so the chart goes left-to-right (Oldest -> Newest)
        const chartData = data.reverse();

        // Get the absolute latest reading for the cards
        const latest = data.length > 0 ? data[data.length - 1] : null;

        return NextResponse.json({ latest, history: chartData });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }
}