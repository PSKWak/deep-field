"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import type { PlanetData } from "@/lib/planets";
import { sceneRadius } from "@/lib/planets";

type CameraRigProps = {
  selectedPlanet: PlanetData | null;
  positions: Map<string, THREE.Vector3>;
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
};

const FLY_DURATION = 1.1;

export default function CameraRig({
  selectedPlanet,
  positions,
  controlsRef,
}: CameraRigProps) {
  const { camera } = useThree();
  const progressRef = useRef(0);
  const startCamPos = useRef(new THREE.Vector3());
  const startTarget = useRef(new THREE.Vector3());

  useEffect(() => {
    if (!selectedPlanet) return;
    progressRef.current = 0;
    startCamPos.current.copy(camera.position);
    startTarget.current.copy(controlsRef.current?.target ?? new THREE.Vector3());
  }, [selectedPlanet, camera, controlsRef]);

  useFrame((_, delta) => {
    if (!selectedPlanet || progressRef.current >= 1) return;
    const pos = positions.get(selectedPlanet.id);
    const controls = controlsRef.current;
    if (!pos || !controls) return;

    progressRef.current = Math.min(1, progressRef.current + delta / FLY_DURATION);
    const t = 1 - Math.pow(1 - progressRef.current, 3); // ease-out cubic

    const radius = sceneRadius(selectedPlanet.radiusKm);
    const desiredDistance = Math.max(radius * 4.5, 2.2);
    const dir = startCamPos.current.clone().sub(startTarget.current);
    const dirNormalized =
      dir.lengthSq() > 0.0001 ? dir.normalize() : new THREE.Vector3(0, 0.3, 1);
    const desiredCamPos = pos.clone().add(dirNormalized.multiplyScalar(desiredDistance));

    camera.position.lerpVectors(startCamPos.current, desiredCamPos, t);
    controls.target.lerpVectors(startTarget.current, pos, t);
    controls.update();
  });

  return null;
}
