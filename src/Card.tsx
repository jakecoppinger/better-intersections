import React from 'react';
import { MailtoDataUnencoded, makeMailtoUri } from './mail';
import { TrafficLightReport } from './types';

interface Props {
    item: TrafficLightReport
}

export default function Card(props: Props) {
    const {item} = props;
    const {greenDuration, flashingDuration, redDuration, cycleTime, notes} = item;

    
    return (
        <div>
            <div style={{
                display: 'flex',
                margin: '8px 0'
            }}>
            </div>
            {/* <MailtoElement item={item} /> */}
            <p style={{marginLeft: 4}}>Green duration: {greenDuration} seconds</p>
            <p style={{marginLeft: 4}}>Flashing red duration: {flashingDuration} seconds</p>
            <p style={{marginLeft: 4}}>Solid red duration: {redDuration} seconds</p>
            <p style={{marginLeft: 4}}>Cycle time: {cycleTime} seconds</p>
            <p>Additional notes: {notes}</p>
        </div>
    );
}
