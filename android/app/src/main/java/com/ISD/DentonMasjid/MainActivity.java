package com.isd.DentonMasjid;

import android.os.Bundle;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private SharedPreferences.OnSharedPreferenceChangeListener prefListener;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        SharedPreferences prefs = getSharedPreferences("CapacitorStorage", Context.MODE_PRIVATE);
        prefListener = (sharedPreferences, key) -> {
            if (key != null && key.startsWith("widget_")) {
                Intent intentDetailed = new Intent(this, PrayerWidgetProvider.class);
                intentDetailed.setAction("com.isd.DentonMasjid.ACTION_REFRESH_WIDGET");
                sendBroadcast(intentDetailed);

                Intent intentCompact = new Intent(this, PrayerCompactWidgetProvider.class);
                intentCompact.setAction("com.isd.DentonMasjid.ACTION_REFRESH_COMPACT_WIDGET");
                sendBroadcast(intentCompact);
            }
        };
        prefs.registerOnSharedPreferenceChangeListener(prefListener);
    }
}
