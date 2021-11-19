import React, { Component } from 'react';
import { AppState, BackHandler } from 'react-native';
import {
  BarcodeTracking,
  BarcodeTrackingBasicOverlay,
  BarcodeTrackingSettings,
  Symbology,
} from 'scandit-react-native-datacapture-barcode';
import {
  Camera,
  CameraSettings,
  DataCaptureContext,
  DataCaptureView,
  FrameSourceState,
  VideoResolution,
  Brush,
  Color,
  Anchor,
  PointWithUnit,
  NumberWithUnit,
  MeasureUnit,
  Feedback,
} from 'scandit-react-native-datacapture-core';

import { requestCameraPermissionsIfNeeded } from './camera-permission-handler';
import { BarcodeListView } from './BarcodeListView';
import { styles, values } from './styles';

export class ScanPage extends Component {

  constructor() {
    super();

    let keyScandit = Platform.OS === 'ios' ? 'AWZw2j4oH8aOAj5WezawUbAXwJZoCGikLXirmB9CDSaaB7210F/zqotSJHh5Rn/Nqkl//b0Tt6MVWqFkQXzxEFZojtTWQiFDJBS6Z8tlWyKAcggAyn6A+WV6Sxm9LQQy5xwn1rwN7KLROpH8BThVjlkUvT4IcixzAs0mgn9aV2zLjrMMUloFAPcjII8mO/kiJ+NmtFyw5ZA8u0W4HZ7telZdeoJB+omlH4Z6DIxUX8X1jWS2HJ222Puby7wwRndp0yB9G6YWsw0w2Q4n+LEap71EJuX+JahhzE0m9jKQzfyfWwCR+IjZPfFo5r43wag4NhcCKuopzLMBAY1hPxIPRakvxyZvcVFkTU31S+carJpXMjJMvgZV2jaa808rtEpGMrNeiA9A5OVUD43EluI8scjAuIG28Tp9xZp9kXqX4tYXAtf5YkZ7ZNRqyrxozjJwoiBvrwMVpN/v0bXYpMZuTi+oNlDMv46ATS/I7MRsskVvxbIWI4grt5UiV2hEh484y7Y92tppGfiYcMx+Ga/eiXeh/U9TLzApLY00GtHStxOQ2y/TRvOz9mt1GOUhKMSgXSK+6c4DtYkb45JrWZySFt7i1jQM+LZ1yKijGXvxBqKmVqt6HeBO+3+P3mwZgrOt3YDlOt/L6gz9MLyarQLqxEU0lBQcjYlL63+DNZVwfe4iJzhr+Xe5yQw0GE5PERgv8qgHc8gLjm/rHwbKtmT6Xbw9U51EDWe85n+ug0rM87RJSUfzrfV0z5fVG04ULz+j0CSrsbaHn2n2ZQURxwJKIzyxItO8JNgFSbbdQkItpoVOhkFsvQGdPa9PFlnI' : 'Ad2gah4oP6esMlwAcC/bPRkA+TCTH2ODOVwvTy5LXPyET/Mu/HC/uBN7/GVsetp1C22Qf7lkEGbBUX1Gb1AfbWZRqwa2eiHIjS9TnxVE1WCwNtiBzVwgXzNOinYLEfu1lSAFofswi+E5LKm5BDGX7XgEmjsieb/t2MR5ivmqs3boe3WnkSJDL+jxVUuO81+FKeiv9aB4LsDBOsqH3xUQAZWa3HNmO+x1YVfk6eBCH2xSE88cRUgYFloKGhiENvilEIR9dkM6sOWpjPIGbSUVDsOgZ2Nw2FVJt048zH7UeWn2h/OdhTAo/aywNesxl9lwJVtH55emKgsrqLtlxRb8wjCEC47JLbV+6jdvqGeBIZ+c0azbs+uo8ec7K5fvKPozUHnvsGpkchAhFDKY/DPcbPoix3vRNJC7+QluMKRu7SfAtR96986qemTHBSmn5u3bsaHsY8Na2cCfT7GJEUI07NbttB6ZFftCbj8E5vts8sUWi1EsYlBPIq1pkHpnNe4zZd0OA+JxROxeWgqwCbGxi2b9Whn4C9Wp6lvygbXyZpvqB4vHdfUkgMzSIkdeeTwkAgPtyV+LkF/8LnLjM7MaMH201SN6QO/fk3cF+sXWu5nTKkwQ+/auryJV+NFqmGcYJpVRRoT4xyBdS4RlvsKP7AgzN6x3ib6ZNPUaXVr/EaT2Pcb3cZ9bU0u6cujwCw2kAGIerbUwQl23wiiOJOUVReP4uhhXZ6RgG7XqOOKW0Y6osEUMlYU8LbuYXJ4oRWv+46Ebvp0Lr2M0XLHMAUYoVCeXEGGsogTF7U29iMv+GcT13KePibVKssLbSQ=='
    // Create data capture context using your license key.
    this.dataCaptureContext = DataCaptureContext.forLicenseKey(keyScandit)
    this.viewRef = React.createRef();

    this.onCaptureResults = this.onCaptureResults.bind(this);
    this.onCardPress = this.onCardPress.bind(this);
    this.onClearPress = this.onClearPress.bind(this);

    // Store results that the barcode scanner is capturing.
    this.results = {};

    this.state = {
      show: false,
      capturedResults: {} // The scan results that will be passed to the barcode list view.
    };
  }

  componentDidMount() {
    AppState.addEventListener('change', this.handleAppStateChange);
    this.setupScanning();

    // Keep Scandit logo visible on screen when scanning.
    this.viewRef.current.logoAnchor = Anchor.BottomRight;
    this.viewRef.current.logoOffset = this.logoOffset();

    this.props.navigation.addListener('focus', () => {
      this.results = {};
    });
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this.handleAppStateChange);
    this.dataCaptureContext.dispose();
  }

  handleAppStateChange = async (nextAppState) => {
    if (nextAppState.match(/inactive|background/)) {
      this.stopCapture();
    } else {
      this.startCapture();
    }
  }

  startCapture() {
    this.startCamera();
    this.barcodeTracking.isEnabled = true;
  }

  stopCapture() {
    this.barcodeTracking.isEnabled = false;
    this.stopCamera();
  }

  stopCamera() {
    if (this.camera) {
      this.camera.switchToDesiredState(FrameSourceState.Off);
    }
  }

  startCamera() {
    if (!this.camera) {
      // Use the world-facing (back) camera and set it as the frame source of the context. The camera is off by
      // default and must be turned on to start streaming frames to the data capture context for recognition.
      this.camera = Camera.default;
      this.dataCaptureContext.setFrameSource(this.camera);

      const cameraSettings = new CameraSettings();
      cameraSettings.preferredResolution = VideoResolution.FullHD;
      this.camera.applySettings(cameraSettings);
    }

    // Switch camera on to start streaming frames and enable the barcode tracking mode.
    // The camera is started asynchronously and will take some time to completely turn on.
    requestCameraPermissionsIfNeeded()
      .then(() => this.camera.switchToDesiredState(FrameSourceState.On))
      .catch(() => BackHandler.exitApp());
  }

  setupScanning() {
    // The barcode tracking process is configured through barcode tracking settings
    // which are then applied to the barcode tracking instance that manages barcode tracking.
    const settings = new BarcodeTrackingSettings();

    // The settings instance initially has all types of barcodes (symbologies) disabled. For the purpose of this
    // sample we enable a very generous set of symbologies. In your own app ensure that you only enable the
    // symbologies that your app requires as every additional enabled symbology has an impact on processing times.
    settings.enableSymbologies([
      Symbology.EAN13UPCA,
      Symbology.EAN8,
      Symbology.UPCE,
      Symbology.Code39,
      Symbology.Code128,
      Symbology.DataMatrix,
      Symbology.QR,
      Symbology.MicroQR,

    ]);

    // Create new barcode tracking mode with the settings from above.
    this.barcodeTracking = BarcodeTracking.forContext(this.dataCaptureContext, settings);

    // Register a listener to get informed whenever a new barcode is tracked.
    this.barcodeTrackingListener = {
      didUpdateSession: (_, session) => {
        this.results = {};
        Object.values(session.trackedBarcodes).forEach(trackedBarcode => {
          const { data, symbology } = trackedBarcode.barcode;
          this.results[data] = { data, symbology };
        });
      }
    };

    this.barcodeTracking.addListener(this.barcodeTrackingListener);

    // Add a barcode tracking overlay to the data capture view to render the location of captured barcodes on top of
    // the video preview. This is optional, but recommended for better visual feedback.
    const overlay = BarcodeTrackingBasicOverlay.withBarcodeTrackingForView(this.barcodeTracking, this.viewRef.current);

    // Implement the BarcodeTrackingBasicOverlayListener interface. 
    // The method BarcodeTrackingBasicOverlayListener.brushForTrackedBarcode() is invoked every time a new tracked 
    // barcode appears and it can be used to set a brush that will highlight that specific barcode in the overlay.
    overlay.listener = {
      brushForTrackedBarcode: (overlay, trackedBarcode) => new Brush(
        Color.fromRGBA(255, 255, 255, 0.4),
        Color.fromRGBA(255, 255, 255, 1),
        2
      )
    };
  }

  logoOffset() {
    return new PointWithUnit(
        new NumberWithUnit(0, MeasureUnit.Pixel),
        new NumberWithUnit(-values.cardMinHeight, MeasureUnit.DIP)
    );
  }

  onCaptureResults() {
    // Do nothing when the card is expanded.
    if (this.state.show) {
      return;
    }

    if (Object.keys(this.results).length !== 0) {
      Feedback.defaultFeedback.emit();
    }

    this.setState({
      capturedResults: Object.assign({}, this.results)
    })
    this.results = {};
  }

  onCardPress() {
    if (this.state.show) {
      this.startCapture();
    } else {
      this.stopCapture();
    }

    this.setState({
      show: !this.state.show
    })
  }

  onClearPress() {
    this.startCapture();
    this.setState({
      show: false
    })
  }

  render() {
    const { show, capturedResults } = this.state;
    return (
      <>
        <DataCaptureView style={styles.scanContainer} context={this.dataCaptureContext} ref={this.viewRef} />
        <BarcodeListView
          show={show}
          results={capturedResults}
          onCaptureResults={this.onCaptureResults}
          onClearPress={this.onClearPress}
          onCardPress={this.onCardPress}
        />
      </>
    );
  };
}
