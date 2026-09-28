import os
import json
from datetime import datetime
from PIL import Image, ExifTags


def extract_exif_metadata(image_path):
    """
    Extracts EXIF metadata from an image file and returns a structured dictionary.
    """
    if not os.path.exists(image_path):
        return {"error": f"File not found: {image_path}"}

    try:
        image = Image.open(image_path)
        exif_data = image._getexif()

        if not exif_data:
            return {
                "file_name": os.path.basename(image_path),
                "has_exif": False,
                "metadata": {}
            }

        # Map EXIF numerical tags to human-readable tag names
        raw_metadata = {}
        for tag_id, value in exif_data.items():
            tag_name = ExifTags.TAGS.get(tag_id, tag_id)
            
            # Handle non-serializable byte data or complex objects
            if isinstance(value, bytes):
                try:
                    value = value.decode("utf-8", errors="ignore").strip('\x00')
                except Exception:
                    value = str(value)
            raw_metadata[str(tag_name)] = value

        # Parse GPS coordinates if available
        gps_info = {}
        if "GPSInfo" in raw_metadata and isinstance(raw_metadata["GPSInfo"], dict):
            gps_tags = ExifTags.GPSTAGS
            for gps_tag_id, gps_val in raw_metadata["GPSInfo"].items():
                gps_tag_name = gps_tags.get(gps_tag_id, gps_tag_id)
                gps_info[str(gps_tag_name)] = str(gps_val)

        # Extract core metadata attributes
        extracted_info = {
            "file_name": os.path.basename(image_path),
            "has_exif": True,
            "camera_make": raw_metadata.get("Make", "Unknown"),
            "camera_model": raw_metadata.get("Model", "Unknown"),
            "date_taken": raw_metadata.get("DateTimeOriginal", raw_metadata.get("DateTime", "Unknown")),
            "software": raw_metadata.get("Software", "Unknown"),
            "orientation": raw_metadata.get("Orientation", "Unknown"),
            "image_width": raw_metadata.get("ExifImageWidth", image.width),
            "image_height": raw_metadata.get("ExifImageHeight", image.height),
            "gps_info": gps_info,
            "raw_exif_summary": {k: str(v) for k, v in list(raw_metadata.items())[:15]}
        }

        return extracted_info

    except Exception as e:
        return {"error": f"Failed to process image: {str(e)}"}


if __name__ == "__main__":
    # Replace with the path to your test image file
    test_image_path = "test.jpg"

    # Call your function and print the metadata summary
    result = extract_exif_metadata(test_image_path)
    import pprint
    pprint.pprint(result)