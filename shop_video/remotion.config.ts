import { Config } from "@remotion/cli/config";
import { VIDEO_CONFIG } from "./src/config/video";

Config.setCodec(VIDEO_CONFIG.codec);
Config.setPixelFormat(VIDEO_CONFIG.pixelFormat);
Config.setVideoImageFormat("png");
Config.setColorSpace("bt709");
