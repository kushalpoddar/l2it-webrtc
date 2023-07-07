from time import time, sleep
import subprocess
import math

def buildFFmpegCommand(i, length, index):
    commands_list = [
        "ffmpeg",
        "-i",
        "./marco_intro.mp4",
        "-threads",
        "6",
        "-ss",
        str(i),
        "-t",
        str(length),
        "{}.mp4".format(index)
        ]
    return " ".join(commands_list)

def returnAudioDuration(filepath):
    commands_list = ["ffprobe", "-v", "error", "-show_entries",
                             "format=duration", "-of",
                             "default=noprint_wrappers=1:nokey=1", filepath]
    result = subprocess.run(" ".join(commands_list), stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
    return float(result.stdout)

def convertVideoToStream(filepath, i, STREAM_SIZE_IN_SECONDS):
    return "ffmpeg -i {} -threads 24 -strict -2 -preset:v veryfast -profile:v baseline -level 3.0 -s 620x620 -start_number 0 -hls_list_size 0 -force_key_frames expr:gte(t,n_forced*{}) -hls_time {} -hls_segment_filename sample-{}-%06d.ts -f hls sample-{}.m3u8".format(filepath, STREAM_SIZE_IN_SECONDS, STREAM_SIZE_IN_SECONDS, i, i)

def runFFmpeg(commands):
    print(commands)
    if subprocess.run(commands).returncode == 0:
        print ("FFmpeg Script Ran Successfully")
    else:
        print ("There was an error running your FFmpeg script")

print(returnAudioDuration("./marco_intro.mp4"))
# print(buildFFmpegCommand(0, 4, 1))
# runFFmpeg(buildFFmpegCommand(0, 4, 1))

FILEPATH = "./marco_intro.mp4"
CHUNK_SIZE_IN_SECONDS = 3
STREAM_SIZE_IN_SECONDS = 1

def pipeline():
    # Get duration of FILE
    duration = returnAudioDuration(FILEPATH)

    # Number of chunks
    n = int(math.ceil(duration / CHUNK_SIZE_IN_SECONDS))

    # Breaking the file into multiple chunks
    runFFmpeg("ffmpeg -i {} -c copy -f segment -segment_time 00:00:03 -reset_timestamps 1 -map 0 fff%d.mp4".format(FILEPATH))
    output_files = []
    
    for i in range(n):
        filename = "./{}.mp4".format(i+1)
        # runFFmpeg(buildFFmpegCommand((i*CHUNK_SIZE_IN_SECONDS), CHUNK_SIZE_IN_SECONDS, i+1))
        # output_files.append(filename)
        # print(returnAudioDuration(filename))
        # Converting it to streams
        # runFFmpeg(convertVideoToStream(filename, (i+1), STREAM_SIZE_IN_SECONDS))

        # if i == 1:
        #     break
        
pipeline()