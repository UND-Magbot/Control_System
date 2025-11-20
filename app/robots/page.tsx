import styles from './robots.module.css';
import RobotList from './components/RobotList';
import RobotInfo from "@/app/lib/robotInfo";
import Floors from '@/app/lib/floorInfo';
import VideoStatus from '@/app/lib/videoStatus';
import cameraView from "@/app/lib/cameraView";

export default async function Page() {

    const [robots, cameras, floors, videoStatus] = await Promise.all([
        RobotInfo(),
        cameraView(),
        Floors(),
        VideoStatus(),
      ]);

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
                <RobotList robots={robots} cameras={cameras} floors={floors} video={videoStatus} />
            </div>
        </>
    )
}