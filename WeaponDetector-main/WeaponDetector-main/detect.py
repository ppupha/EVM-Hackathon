import argparse
import numpy as np
import torch

from models.experimental import attempt_load
from utils.datasets import letterbox
from utils.general import check_img_size, non_max_suppression, scale_coords
from utils.torch_utils import select_device


# Initialize
device = select_device('')
half = device.type != 'cpu'  # half precision only supported on CUDA

# Load model
model = attempt_load(['weights/best.pt'], map_location=device)  # load FP32 model
imgsz = check_img_size(640, s=model.stride.max())  # check img_size
if half:
    model.half()  # to FP16

# Run inference
img = torch.zeros((1, 3, imgsz, imgsz), device=device)  # init img
_ = model(img.half() if half else img) if device.type != 'cpu' else None  # run once

# Get names
names = model.module.names if hasattr(model, 'module') else model.names


def detect(img0):
    global img

    # Padded resize
    img = letterbox(img0, new_shape=imgsz)[0]

    # Convert
    img = img[:, :, ::-1].transpose(2, 0, 1)  # BGR to RGB, to 3x416x416
    img = np.ascontiguousarray(img)

    img = torch.from_numpy(img).to(device)
    img = img.half() if half else img.float()  # uint8 to fp16/32
    img /= 255.0  # 0 - 255 to 0.0 - 1.0
    if img.ndimension() == 3:
        img = img.unsqueeze(0)

    # Inference
    pred = model(img)[0]

    # Apply NMS
    pred = non_max_suppression(pred, 0.25, 0.45)

    result = []

    # Process detections
    for i, det in enumerate(pred):  # detections per image

        if len(det):
            # Rescale boxes from img_size to img0 size
            det[:, :4] = scale_coords(img.shape[2:], det[:, :4], img0.shape).round()

            # Write results
            for *xyxy, conf, cls in reversed(det):
                if conf > 0.5:
                    label = '%s %.2f' % (names[int(cls)], conf)
                    c1, c2 = (int(xyxy[0]), int(xyxy[1])), (int(xyxy[2]), int(xyxy[3]))
                    result.append([label, (c1, c2)])

    return result
