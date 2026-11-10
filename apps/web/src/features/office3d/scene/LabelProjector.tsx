import { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3 } from 'three';
import { useOverlayBus } from './overlay';

/**
 * Chiếu các neo 3D lên tọa độ màn hình và ghi transform vào phần tử nhãn DOM tương ứng.
 * Chạy mỗi khung hình nhưng không gây re-render React.
 */
export function LabelProjector() {
  const bus = useOverlayBus();
  const tmp = useMemo(() => new Vector3(), []);

  useFrame(({ camera, size }) => {
    for (const [key, el] of bus.elements) {
      const anchor = bus.anchors.get(key);
      if (!anchor) {
        el.style.visibility = 'hidden';
        continue;
      }
      if (anchor.object) {
        anchor.object.updateWorldMatrix(true, false);
        anchor.object.getWorldPosition(tmp);
      } else if (anchor.position) {
        tmp.set(anchor.position[0], anchor.position[1], anchor.position[2]);
      } else {
        el.style.visibility = 'hidden';
        continue;
      }
      tmp.y += anchor.offsetY;
      tmp.project(camera);
      const x = (tmp.x * 0.5 + 0.5) * size.width;
      const y = (0.5 - tmp.y * 0.5) * size.height;
      const visible = tmp.z > -1 && tmp.z < 1 && x > -260 && x < size.width + 260 && y > -40 && y < size.height + 260;
      el.style.visibility = visible ? 'visible' : 'hidden';
      el.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) translate(-50%,-100%)`;
    }
  });

  return null;
}
