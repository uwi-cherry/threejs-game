import { IWorld, defineQuery } from 'bitecs'
import { Camera } from './Camera'
import { InputState } from '../input/InputState'
import { resetCameraRotation, CameraInputParams } from './CameraFollowSystem'

const cameraQuery = defineQuery([Camera])
const inputQuery = defineQuery([InputState])

export const cameraInputSystem = (
  world: IWorld,
  playerEid: number,
  params: CameraInputParams
) => {
  const cameras = cameraQuery(world)
  const inputs = inputQuery(world)

  if (cameras.length === 0) return world

  const cameraEid = cameras[0]
  const inputEid = inputs.length > 0 ? inputs[0] : null

  if (inputEid === null) return world

  // Handle camera distance with mouse wheel
  const wheelDelta = InputState.mouseWheel?.[inputEid] || 0
  if (Math.abs(wheelDelta) > 0.1) {
    Camera.targetDistance[cameraEid] = Math.max(
      params.minDistance,
      Math.min(
        params.maxDistance,
        Camera.targetDistance[cameraEid] + wheelDelta * 2
      )
    )
  }


  // Handle camera rotation with mouse movement
  const deltaX = InputState.mouseDelta.x[inputEid]
  const mouseY = InputState.mouseY[inputEid]

  const rotationSpeed = 0.02
  if (Math.abs(deltaX) > 0.001) {
    Camera.rotationH[cameraEid] -= Math.sign(deltaX) * rotationSpeed
  }

  const verticalRange =
    (params.verticalLimitUp - params.verticalLimitDown) * (Math.PI / 180)
  Camera.rotationV[cameraEid] =
    mouseY * verticalRange * 0.5 + (params.verticalLimitDown * Math.PI) / 180

  // Handle reset rotation
  if (InputState.reset?.[inputEid]) {
    resetCameraRotation(cameraEid)
  }

  // Apply vertical rotation limits
  const upLimit = (params.verticalLimitUp * Math.PI) / 180
  const downLimit = (params.verticalLimitDown * Math.PI) / 180
  Camera.rotationV[cameraEid] = Math.max(
    downLimit,
    Math.min(upLimit, Camera.rotationV[cameraEid])
  )

  return world
}
