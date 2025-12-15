using Newtonsoft.Json;

namespace NzbDrone.Core.Download.Clients.Qnap
{
    public class QnapLoginResponse
    {
        [JsonProperty("error")]
        public int Error { get; set; }

        [JsonProperty("reason")]
        public string Reason { get; set; }

        [JsonProperty("sid")]
        public string Sid { get; set; }

        [JsonProperty("token")]
        public string Token { get; set; }
    }

    public class QnapTaskResponse
    {
        [JsonProperty("error")]
        public int Error { get; set; }

        [JsonProperty("reason")]
        public string Reason { get; set; }

        [JsonProperty("data")]
        public QnapTaskItem[] Data { get; set; }

        [JsonProperty("status")]
        public QnapTaskStatus Status { get; set; }
    }

    public class QnapTaskItem
    {
        [JsonProperty("hash")]
        public string Hash { get; set; }

        [JsonProperty("state")]
        public int State { get; set; }

        [JsonProperty("source_name")]
        public string SourceName { get; set; }

        [JsonProperty("size")]
        public long Size { get; set; }

        [JsonProperty("down_size")]
        public long DownSize { get; set; }

        [JsonProperty("progress")]
        public float Progress { get; set; }

        [JsonProperty("down_rate")]
        public long DownRate { get; set; }

        [JsonProperty("up_rate")]
        public long UpRate { get; set; }

        [JsonProperty("eta")]
        public int Eta { get; set; }

        [JsonProperty("move")]
        public string Move { get; set; }

        [JsonProperty("source")]
        public string Source { get; set; }

        [JsonProperty("error")]
        public string Error { get; set; }

        [JsonProperty("category")]
        public int Category { get; set; }

        [JsonProperty("share")]
        public float Share { get; set; }

        [JsonProperty("create_time")]
        public string CreateTime { get; set; }
    }

    public class QnapTaskStatus
    {
        [JsonProperty("all")]
        public int All { get; set; }

        [JsonProperty("active")]
        public int Active { get; set; }

        [JsonProperty("downloading")]
        public int Downloading { get; set; }

        [JsonProperty("paused")]
        public int Paused { get; set; }

        [JsonProperty("completed")]
        public int Completed { get; set; }

        [JsonProperty("down_rate")]
        public long DownRate { get; set; }

        [JsonProperty("up_rate")]
        public long UpRate { get; set; }
    }

    public class QnapAddUrlResponse
    {
        [JsonProperty("error")]
        public int Error { get; set; }

        [JsonProperty("reason")]
        public string Reason { get; set; }

        [JsonProperty("hash")]
        public string Hash { get; set; }
    }

    public class QnapDirResponse
    {
        [JsonProperty("error")]
        public int Error { get; set; }

        [JsonProperty("reason")]
        public string Reason { get; set; }

        [JsonProperty("data")]
        public QnapDir[] Data { get; set; }
    }

    public class QnapDir
    {
        [JsonProperty("path")]
        public string Path { get; set; }

        [JsonProperty("writtable")]
        public bool Writable { get; set; }
    }

    public class QnapBasicResponse
    {
        [JsonProperty("error")]
        public int Error { get; set; }

        [JsonProperty("reason")]
        public string Reason { get; set; }
    }
}
