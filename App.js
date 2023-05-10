import {StatusBar} from 'expo-status-bar';
import {StyleSheet, Text, View, Button, ActivityIndicator} from 'react-native';
import React from 'react';

import {FFmpegKit, FFmpegKitConfig, ReturnCode} from 'ffmpeg-kit-react-native';
import {makeDirectoryAsync, getInfoAsync, cacheDirectory} from 'expo-file-system';
import {launchImageLibraryAsync, MediaTypeOptions} from 'expo-image-picker';
import {Video, AVPlaybackStatus} from 'expo-av';

const getResultPath = async () => {
  const videoDir = `${cacheDirectory}video/`;

  // Checks if gif directory exists. If not, creates it
  async function ensureDirExists() {
    const dirInfo = await getInfoAsync(videoDir);
    if (!dirInfo.exists) {
      console.log("tmp directory doesn't exist, creating...");
      await makeDirectoryAsync(videoDir, { intermediates: true });
    }
  }

  await ensureDirExists();
  return `${videoDir}-${(Math.random() + 1).toString(36).substring(7)}.mp4`;
}

const getSourceVideo = async () => {
  console.log('select video')
  const result = await launchImageLibraryAsync({
    mediaTypes: MediaTypeOptions.Videos
  })
  console.log('result', result);
  return (result.canceled) ? null : {sourceVideo: result.uri, height: result.height, width: result.width}
}

export default function App() {
  const [result, setResult] = React.useState('');
  const [source, setSource] = React.useState('');
  const [isLoading, setLoading] = React.useState(false);

  React.useEffect(() => {
    FFmpegKitConfig.init();
  }, []);

  const onPress = async () => {
    setLoading(() => true);
    setResult(() => '');

    const resultVideo = await getResultPath();
    const {sourceVideo, height, width} = await getSourceVideo();
    // let cWidth = 720, cHeight = 480
    // if (width>720 && height>480) {
    //   if(width/height >= 720/480) {
    //     cWidth = width*480/height
    //   }
    //   else{
    //     cHeight = height*720/width
    //   }
    // }
    // console.log(`${width}/${height} = ${cWidth}x${cHeight}`);

    // const x =  Math.round((width - cWidth) / 2)
    // const y =  Math.round((height - cHeight) / 2)

    const x =  Math.round((width - 720) / 2)
    const y =  Math.round((height - 480) / 2)

    console.log(`start at = ${x}:${y}`);


    if (!sourceVideo) {
      setLoading(() => false);
      return;
    }
    setSource(() => sourceVideo)

    const ffmpegSession = await FFmpegKit
      // .execute(`-i ${sourceVideo} -c:v mpeg4 -ss 00:00:10 -t 00:00:30 -filter:v "crop=720:480:0:0" -s 720x480 -c:a copy -y ${resultVideo}`);
      .execute(`-i ${sourceVideo} -c:v mpeg4 -ss 00:00:10 -t 00:00:30 -s 720x480 -c:a copy -y ${resultVideo}`);
      // .execute(`-i ${sourceVideo} -c:v mpeg4 -ss 00:00:10 -t 00:00:30 -filter:v "crop=720:480:${x}:${y}" -y ${resultVideo}`);

    const result = await ffmpegSession.getReturnCode();

    if (ReturnCode.isSuccess(result)) {
      setLoading(() => false);
      setResult(() => resultVideo);
      console.log('resultVideo', resultVideo)
    } else {
      setLoading(() => false);
      console.error(result);
    }

    console.log('sourceVideo', sourceVideo)
  }

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <Button
        onPress={onPress}
        title="Select video"
        color="#841584"
       />

      {isLoading && <ActivityIndicator size="large" color="#ff0033" />}
      <Plyr uri={source} title={'Source'} />
      {result &&
        <Plyr uri={result} title={'Result'} />
      }
    </View>
  );
}


const Plyr = (props) => {
  const video = React.useRef(null);
  const [status, setStatus] = React.useState({});

  return (
    <View style={styles.videoContainer}>
      <Text>{props.title}</Text>
      <Video
        ref={video}
        style={styles.video}
        source={{
          uri: props.uri,
        }}
        useNativeControls
        resizeMode="contain"
        isLooping
        onPlaybackStatusUpdate={(status) => setStatus(() => status)}
      />
      <View style={styles.buttons}>
        <Button
          title={status?.isPlaying ? 'Pause' : 'Play'}
          disabled={(props.uri == '')}
          onPress={() =>
            status.isPlaying ? video?.current.pauseAsync() : video?.current.playAsync()
          }
        />
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoContainer: {
    backgroundColor: '#ecf0f1',
    marginTop: 20,
    textAlign: 'center',
    padding: 10,

  },
  video: {
    alignSelf: 'center',
    width: 320,
    height: 200,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});