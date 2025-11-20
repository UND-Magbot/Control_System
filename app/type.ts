export type Video = {
    id: number;
    label: string;
}

export type Floor = {
    id: number;
    label: string;
};

export type Robot = { 
    id: number;
    name: string;
};


export type Camera = { 
    id: number;
    label: string;
    webrtcUrl: string;
};


export type RobotRowData = {
    id: number;
    no: string;
    info: string;
    battery: number;
    isCharging: boolean;
    network: 'Online' | 'Offline' | 'Error';
    power: 'On' | 'Off';
    mark: 'Yes' | 'No';
};

export type BatteryItem = {
    id: number;
    label: string;
}