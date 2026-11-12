"""JSON-lines subprocess protocol. Models are explicitly downloaded by setup, never by a request."""
import sys, os, json

def emit(**data):
    print(json.dumps(data, ensure_ascii=False), flush=True)

def probe(path):
    import av
    with av.open(path) as container:
        if not container.streams.audio:
            raise ValueError('文件中没有音轨')
        # Decode frames: do not trust attacker-controlled container duration metadata.
        duration = 0.0
        for frame in container.decode(audio=0):
            duration += frame.samples / frame.sample_rate
            if duration > 1800:
                raise ValueError('音频超过 30 分钟')
        if duration <= 0:
            raise ValueError('音频为空或无法解码')
        return duration

def model_dir():
    return os.path.join('.runtime', 'models', os.environ.get('WHISPER_MODEL','medium'))

try:
    command = sys.argv[1]
    if command == 'setup':
        from huggingface_hub import snapshot_download
        snapshot_download('Systran/faster-whisper-' + os.environ.get('WHISPER_MODEL','medium'), local_dir=model_dir())
        emit(type='result', ready=True)
    elif command == 'health':
        import av, faster_whisper
        emit(type='result', ready=os.path.isfile(os.path.join(model_dir(),'model.bin')))
    elif command == 'probe':
        emit(type='result', duration=probe(sys.argv[2]))
    elif command == 'transcribe':
        from faster_whisper import WhisperModel
        if not os.path.isfile(os.path.join(model_dir(),'model.bin')):
            raise ValueError('识别模型未下载，请运行 npm run audio:setup')
        model = WhisperModel(model_dir(), device=os.environ.get('WHISPER_DEVICE','cpu'), compute_type=os.environ.get('WHISPER_COMPUTE_TYPE','int8'), local_files_only=True)
        segments, info = model.transcribe(sys.argv[2], beam_size=5, vad_filter=True, multilingual=True, condition_on_previous_text=False)
        output = []
        for segment in segments:
            if segment.text.strip():
                output.append(dict(start=segment.start, end=segment.end, text=segment.text.strip()))
            emit(type='progress', progress=min(90, int(segment.end/max(info.duration,1)*90)))
        if not output:
            raise ValueError('没有识别到可用语音，请检查录音是否静音。')
        emit(type='result', segments=output, text='\n'.join(s['text'] for s in output))
    else:
        raise ValueError('未知命令')
except Exception as error:
    emit(type='result', error=str(error))
    sys.exit(1)
