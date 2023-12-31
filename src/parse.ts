import fs from 'fs';

const data = JSON.parse(fs.readFileSync('rides.json', 'utf8'));

const keys = [
    'start_date_local',
    'name',
    'distance',
    'total_elevation_gain',
    'moving_time',
    'average_speed',
    'average_cadence',
    'average_watts',
    'max_watts',
    'weighted_average_watts',
    'kilojoules',
    'device_watts',
    'average_heartrate',
    'max_heartrate',
    'trainer',
    'average_temp'
];

const cols = data.map((x: any) => {
    const vals = keys.map(k => `"${x[k]}"`);
    return vals.join(',');
});

const rows: string[] = [];
rows.push(keys.join(','));
rows.push(cols.join('\n'));

fs.writeFileSync('rides.csv', rows.join('\n'));
