# ProGuard rules for NanoTube
# Add project specific ProGuard rules here.

-keep class com.nanotube.model.** { *; }
-keep class com.nanotube.api.** { *; }

# Retrofit
-keepattributes Signature, InnerClasses, EnclosureMethod
-keepattributes RuntimeVisibleAnnotations, RuntimeVisibleParameterAnnotations
-keepattributes RuntimeInvisibleAnnotations, RuntimeInvisibleParameterAnnotations
-dontwarn okio.**
-dontwarn javax.annotation.**
-dontwarn org.codehaus.mojo.animal_sniffer.**

# Gson
-keep class com.google.gson.** { *; }

# Glide
-keep public class * extends com.bumptech.glide.module.AppGlideModule
-keep public class * extends com.bumptech.glide.module.LibraryGlideModule
-keep class com.bumptech.glide.GeneratedAppGlideModuleImpl
