import { DateTime } from "next-auth/providers/kakao";

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

export type NetworkItem = {
    id: number;
    label: string;
}

export type PowerItem = {
    id: number;
    label: string;
}

export type LocationItem = {
    id: number;
    label: string;
}

export type VideoItem = {
    id: number;
    robotNo: string;
    cameraNo: string;
    cameraType: string;
    filename: string,
    contentType: string;
    data: string;
    videoTime: string;
    date: DateTime;
}

// VideoItem과 임시로 동일하게 적용
export type DtItem = {
    id: number;
    robotNo: string;
    cameraNo: string;
    cameraType: string;
    filename: string,
    contentType: string;
    data: string;
    videoTime: string;
    date: DateTime;
}

export type Period = '1week' | '1month' | '1year' | null;