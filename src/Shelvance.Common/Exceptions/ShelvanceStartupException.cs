using System;

namespace NzbDrone.Common.Exceptions
{
    public class ShelvanceStartupException : NzbDroneException
    {
        public ShelvanceStartupException(string message, params object[] args)
            : base("Shelvance failed to start: " + string.Format(message, args))
        {
        }

        public ShelvanceStartupException(string message)
            : base("Shelvance failed to start: " + message)
        {
        }

        public ShelvanceStartupException()
            : base("Shelvance failed to start")
        {
        }

        public ShelvanceStartupException(Exception innerException, string message, params object[] args)
            : base("Shelvance failed to start: " + string.Format(message, args), innerException)
        {
        }

        public ShelvanceStartupException(Exception innerException, string message)
            : base("Shelvance failed to start: " + message, innerException)
        {
        }

        public ShelvanceStartupException(Exception innerException)
            : base("Shelvance failed to start: " + innerException.Message)
        {
        }
    }
}
