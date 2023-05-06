import { withAppBuildGradle } from '@expo/config-plugins';

const withFFmpegPackageOptions = (config) => {
    return withAppBuildGradle(config, async config => {
        const packagingOptions =
          "\nandroid {\n \
            packagingOptions {\n \
                pickFirst 'lib/x86/libc++_shared.so'\n \
                pickFirst 'lib/x86_64/libc++_shared.so'\n \
                pickFirst 'lib/armeabi-v7a/libc++_shared.so'\n \
                pickFirst 'lib/arm64-v8a/libc++_shared.so'\n \
                pickFirst 'lib/x86/libfbjni.so'\n \
                pickFirst 'lib/armeabi-v7a/libfbjni.so'\n \
                pickFirst 'lib/arm64-v8a/libfbjni.so'\n \
                pickFirst 'lib/x86_64/libfbjni.so'\n \
            }\n";
    
            const newContents = config.modResults.contents.replace(
                'android {\n',
                packagingOptions
        );
            config.modResults.contents = newContents;
                console.log(config);
            return config;
        });
  };
  
  // 💡 Usage:
  
  /// Create a config
  const config = {
    name: 'ffmpeg-expo-example',
  };
  
  /// Use the plugin
  export default withFFmpegPackageOptions(config);
  