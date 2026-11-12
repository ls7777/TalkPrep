const byCode={
 invalid_credentials:'メールアドレスまたはパスワードが正しくありません。',
 email_not_confirmed:'メールアドレスの確認が完了していません。',
 user_already_exists:'このメールアドレスはすでに登録されています。',email_exists:'このメールアドレスはすでに登録されています。',
 signup_disabled:'現在、新規登録は受け付けていません。',weak_password:'パスワードは8文字以上で、より安全なものを設定してください。',
 over_request_rate_limit:'操作が多すぎます。しばらく待ってから再度お試しください。',over_email_send_rate_limit:'メール送信回数の上限に達しました。しばらくお待ちください。',
 captcha_failed:'認証に失敗しました。もう一度お試しください。',session_not_found:'ログインの有効期限が切れました。再度ログインしてください。',refresh_token_not_found:'ログインの有効期限が切れました。再度ログインしてください。',
 PGRST205:'データベースの初期設定が必要です。移行SQLを実行してください。',
 NotAllowedError:'マイクの使用が許可されていません。ブラウザーの設定を確認してください。',NotFoundError:'マイクが見つかりません。接続を確認してください。',NotReadableError:'マイクを使用できません。他のアプリで使用中でないか確認してください。'
}
const patterns=[
 [/Invalid login credentials/i,byCode.invalid_credentials],[/Email not confirmed/i,byCode.email_not_confirmed],[/already registered|already exists/i,byCode.user_already_exists],
 [/fetch failed|Failed to fetch|NetworkError|network request/i,'通信に失敗しました。接続とサーバーの状態を確認してください。'],
 [/尚未配置 Supabase|账号服务尚未配置/,'アカウントサービスが設定されていません。設定を確認してください。'],
 [/数据库操作失败/,'データベースに接続できません。設定を確認してください。'],
 [/请先登录|登录已过期/,'ログインが必要です。再度ログインしてください。'],
 [/不存在|内容不存在/,'指定されたデータが見つかりません。'],
 [/30 分钟/,'音声は30分以内にしてください。'],[/100 MB/,'音声ファイルは100 MB以下にしてください。'],
 [/M4A.*MP3/,'M4A、MP3、WAV、WebM形式の音声を選択してください。'],
 [/没有识别到可用语音|没有音轨|音频为空/,'音声を認識できませんでした。無音でないか、録音内容を確認してください。'],
 [/原录音已清理|临时录音已不存在/,'元の音声ファイルは削除されています。再度アップロードしてください。'],
 [/Python|识别模型未下载/,'音声認識の環境が準備できていません。Pythonと認識モデルを確認してください。'],
 [/audio:setup|识别模型/,'音声認識モデルが準備できていません。モデルをインストールしてください。'],
 [/本地翻译服务|翻译结果|中文片段|判断片段语言|日语转换/,'翻訳に失敗しました。ローカルモデルを確認して再試行してください。'],
 [/请安装并启动 Ollama|ollama pull/,'Ollamaを起動し、指定された翻訳モデルをインストールしてください。'],
 [/音频处理超时/,'音声処理がタイムアウトしました。短い録音で再試行してください。'],
 [/音频处理失败|无法解码/,'音声ファイルを読み込めません。別のファイルでお試しください。'],
 [/最多同时提交/,'同時に処理できる録音は3件までです。完了までお待ちください。'],
 [/只有失败任务可重试/,'失敗した処理のみ再試行できます。'],[/完成后才能修改|等待任务结束/,'処理が完了してから操作してください。'],
 [/请选择录音文件/,'音声ファイルを選択してください。'],[/文本长度不正确/,'テキストの長さが上限を超えています。'],
 [/浏览器不支持/,'このブラウザーでは録音できません。音声ファイルをアップロードしてください。'],
 [/复制失败/,'コピーできませんでした。テキストを選択してコピーしてください。']
]
export function japaneseError(error){
 const value=typeof error==='string'?{message:error}:error||{}
 if(Object.hasOwn(byCode,value.code))return byCode[value.code]
 if(Object.hasOwn(byCode,value.name))return byCode[value.name]
 const message=String(value.message||'')
 for(const [pattern,text] of patterns)if(pattern.test(message))return text
 if(/[\u3040-\u30ff]/.test(message))return message
 return '処理に失敗しました。しばらく待ってからもう一度お試しください。'
}
