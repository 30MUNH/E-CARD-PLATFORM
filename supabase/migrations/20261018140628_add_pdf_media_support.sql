alter table public.media_assets
  drop constraint if exists media_assets_media_type_check;

alter table public.media_assets
  add constraint media_assets_media_type_check
  check (media_type in ('image', 'audio', 'video', 'pdf'));

update storage.buckets
set file_size_limit = 52428800,
    allowed_mime_types = array[
      'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif',
      'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-m4a', 'audio/mp4', 'audio/ogg',
      'video/mp4', 'video/webm', 'video/quicktime', 'application/pdf'
    ]
where id = 'ecard-media' and public = false;
