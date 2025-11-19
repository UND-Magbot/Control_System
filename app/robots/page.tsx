import styles from './robots.module.css';
import RobotList from './components/RobotList';
import CameraView from './components/CameraView';
import MapView from './components/MapView';
import BatterySelectBox from './components/BatterySelectBox';
import NetworkSelectBox from './components/NetworkSelectBox';
import PowerSelectBox from './components/PowerSelectBox';
import LocationSelectBox from './components/LocationSelectBox';
import RobotInfo from "@/app/lib/robotInfo";
import { RemoteBtn, RobotPathBtn } from '@/app/components/button';

export default async function Page() {

    const robots = await RobotInfo();

    return (
        <>
            <div className={styles.topPosition} >
                <h1>Robot Management</h1>
                
                <div className={styles.robotCount}>
                    <div className={styles.countItem}>
                        <div>Total</div>
                        <div className={styles.totalNumber}>12</div>
                    </div>
                    <div>|</div>
                    <div className={styles.countItem}>
                        <div>Operating</div>
                        <div className={styles.itemNumber}>3</div>
                    </div>
                    <div>|</div>
                    <div className={styles.countItem}>
                        <div>Idle</div>
                        <div className={styles.itemNumber}>9</div>
                    </div>
                    <div>|</div>
                    <div className={styles.countItem}>
                        <div>Discharged</div>
                        <div className={styles.itemNumber}>6</div>
                    </div>
                    <div>|</div>
                    <div className={styles.countItem}>
                        <div>charging</div>
                        <div className={styles.itemNumber}>1</div>
                    </div>
                </div>
            </div>
            <div className={styles.middlePosition}>
                <div className={styles.RobotStatusList}>
                    <div className={styles.RobotStatusTopPosition}>
                        <h2>Robot List</h2>
                        <div className={styles.RobotSearch}>
                            <BatterySelectBox />
                            <NetworkSelectBox />
                            <PowerSelectBox />
                            <LocationSelectBox />
                        </div>
                    </div>
                    <RobotList robotRows={robots} />
                    <div></div>
                </div>
                <div className={styles.cameraMapView}>
                    <h2>Location Map & Real-time Camera</h2>
                    <MapView />
                    <br />
                    <CameraView />
                    <br />
                    <div className={styles.ModalOpenBox}>
                        {/* <RemoteBtn selectedRobots={selectedRobot} robots={robots} video={video} /> */}
                        {/* <RobotPathBtn /> */}
                    </div>
                </div>
            </div>
        </>
    )
}