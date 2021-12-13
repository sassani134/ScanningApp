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

    //let keyScandit = Platform.OS === 'ios' ? 'ASSQAi/rDNboP6i7FvuagIozinACOSIgi0jQRepNlnsaSAjAhEYxd5xLbPM1WQuc1m7y+Xt7XAY0X1HszEaLLDYSJNfCZNVjdhUo0HhtSNTSUU9RtgNbTkgkWFsXEZesFhlGUmYvRwmZFk05R+KblUJxHF+6rD+x2RTcb6OtkKNSSXXHLv9vq+5SMCgZfiPHfjDUTsLSYESAx9prj0hY5A7EvirfFJLs+QSN3I7w7lPKfgXtNEjBt9bg7KiA+XxjpEQ8IjIRZrb938ftIa5xdXpGmx4A3ovqhdyuMrLEhvqjSPo62TWVaZecouTkYWCaWZlrbyXVwILcJvgCJW2nJfZlXnM/MCqIYGhKXBkyZ0MFmjZuDnNgRqqmAcWqFQk7qQnkVVKH6cyi5ts94+1FB2DnRgbgqH6OvPiOVnlVSI2W5GV5JUR5ATbu0vVPwPZWfRbZBdl5XgnDeiQFczLlR7yxexV53IRIMew/B2l0xwopdKhHLHZPb2Z305BAwnIKR746C4BwIEMITtda+yRFflXWzAp3lsGtCfBTlFTUrjZUQQy929C9Vjo/JrnxrMpgP7lMczY6hFoe6rYKEGAmAhJoUvStJJbb3/9jeff4bdn85sVGwqw4gnfaZwSBoEPWu9Bl/7t7Z+Faok4C7lcSp8KrEWgo6Q+WY8+gZs/5a6JQpseB4jH0yxAbwTGAVUrSYtDmcsv/wgYFucqm7NJPJll21b+seky8GEJg75AT46ws37uVQsvi4gfRRU+x2XxFmkpSBwbnhOyN/wrDrQ/AbiWiBbxbjcq+74y4yADkEyX5tXf1M+YJwSH1' : 'AZZw0g/rLHt3Dzf1QeF9g1lDibIoOPh4a2fQ/gBkPGDoULokCUAcNj9sXzXdcAYtrSFLc+RWqHiFesjC1VPv/vkGnbu5Tb4ezh2A67x2DCFGR7seindER3ISm4opD5nBESbheiw1fHEGp8Qrho4FFZZrV2c6IyRK+YDA3VLH0a4jz3SGLH5CHkPny31NAydKgjMH+QszKN3Rja0QXoH08BUMi0kxzbxBAJI08URhqg4kxoElS91raycerzVP3Rh0CLylGDZDNotF/ObUpdsCqAbF7NbJ96BjcqlauDFbT+ky85tmrvD0V3hi1IVywLMeraO6gIHwVa+AAIN5LwsdD6CrovAYlaXlri9gcQKXa9NlP352VoyHBUt6UrzVAnZa1htJdgjW5s1wGU341iI2CZ2ceEze4SGnUtIq/IIJwGJgggME0e6Ht0uNFXDa5HhyL1bPdK6SZv1juasQSHTbyhcXJHG4C0JZSZ6XpxlgHJwzjZ2klb2oMdaZvsv9wYnS44WbPhbftUGYhsUcttjBagLLrvQs1o7EW9rbPte0m4QYOc48iy616MTKrj8muMtyGS1XroWSB2GNZG55L+FXPolmXuoj7mJoabpzNH8IpZ3BSteWDccYdA7iJOa7EUIQLj9wna4QHIVmj88fVSro7GIgjaZu5cCwMI8A6UEIk1Ka1Y64ap00Pdm24YZG2Ydq0cuPckJJcQ0+jkeDmm3NmuQ7iCV0/HgGguvHQXH2793hhT6pIhawVqHt3+xTErtH94PEwsieRamZrfsuTnTunVOdOF2dt9U3BJz6iINUzeGpJYkOJucfhNE='
    // Create data capture context using your license key.
    this.dataCaptureContext = DataCaptureContext.forLicenseKey("AQeAHCfrBEFdQp37J9I77htFawpGLLavvlTln3t1N8EWWNTZq2pe9SZVhjRjd/69XW4TQ3JxpYTcM5S452xGczoE5hapbn63byjhsJdSt/XoWKUyVAsZpnNr4IOKZvmXlDNMvfYgdKNfE/JhJBFE6NMEEzLLP7sXwA0xmoQGyueS8s0NSM6rTsHm5Ku07PmzG8aBJBbanhIESiTiEIge36yxsSQ52KK0ptncecrPcXlkZvPUu0ugFmFvjsX4JQXcV0PDALAR50IjIPMIqlvqxyoHrtny7awzY78L+V68bJCab5xhr0UOHQFfeH0Cu2x1cehEfr1uUBlBr4DvbM+88ymu/LKNIdwFNncIND4tVTAU9LccoMF3iMp8HDe8PYn/PdnKppMUshmuN5Kuuzd/UhzzH8daoYB8kq5HgLhgEvKpeLv+cfV2AXArzGl0BHHpJFK66eBnDnsAWC9mGrRgu1faX+aGGipRxsA4lNjqx152KlQJ46kdneiNewMm0zzW20e1a6DuWxlJ/lQe7o9VKC5vp9w1y+hXCSlGFkOFwSOf5Anb4pKRbBQ2HhUPSFo9vhfIr2oUgnBdiyMLO/5OcfGPKtCHJ40WcExhMM7Hqtvb1eCxNtLgFVZV5JSUG8CKdkWU5RbRsKvutarRdBnz2LLTkmUIt4AwT8qRCSrDRTsDRk1xadgGHCs8z5A0MEbztBBje4snK7rcgDX+XRqzW80TGiWz3Jjg0L8LEfw7aWsqvI6+aSI7s5r5gDNpsHJkZ9yywhx/xoo4VAXTCR81In89mAKxm889a85+01Ukh8hFkqoEAX8+2VOv7/NtUctjAYG9W/lOhSJcmkeBw00=")
    this.viewRef = React.createRef();

    this.onCaptureResults = this.onCaptureResults.bind(this);
    this.onCardPress = this.onCardPress.bind(this);
    this.onClearPress = this.onClearPress.bind(this);

    // Store results that the barcode scanner is capturing.
    this.results = {};

    this.state = {
      show: false,
      capturedResults: {}, // The scan results that will be passed to the barcode list view.
      
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
    console.log("onCaptureResults");
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
    console.log("onCardPress");
    console.log(this.state);
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
